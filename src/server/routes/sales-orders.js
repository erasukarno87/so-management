import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

function normalizeDeliveryDate(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return '';
  const y = String(parsed.getFullYear()).padStart(4, '0');
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function buildBucketNoFromDate(deliveryDate) {
  const normalizedDate = normalizeDeliveryDate(deliveryDate);
  if (!normalizedDate) return '';
  const year = Number(normalizedDate.slice(0, 4));
  const month = Number(normalizedDate.slice(5, 7));
  const day = Number(normalizedDate.slice(8, 10));
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day) || month < 1 || month > 12) return '';
  const bucketIndex = (month - 1) * 2 + (day <= 15 ? 1 : 2);
  return String(year) + '-' + String(bucketIndex).padStart(2, '0');
}

function normalizeBucketNo(value, deliveryDate) {
  const text = String(value || '').trim();
  if (!text) return buildBucketNoFromDate(deliveryDate);
  const match = text.match(/^(\d{4})[-\s_/]?(\d{1,2})$/);
  if (!match) return buildBucketNoFromDate(deliveryDate);
  const bucketIndex = Number(match[2]);
  if (!Number.isFinite(bucketIndex) || bucketIndex < 1 || bucketIndex > 24) return buildBucketNoFromDate(deliveryDate);
  return match[1] + '-' + String(bucketIndex).padStart(2, '0');
}

// GET all sales orders (with optional grouping)
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, customer_id, from_date, to_date, search, group_by_so } = req.query;
    let query = 'SELECT * FROM sales_orders WHERE 1=1';
    const params = [];
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (customer_id) { query += ' AND customer_id = ?'; params.push(customer_id); }
    if (from_date) { query += ' AND delivery_date >= ?'; params.push(from_date); }
    if (to_date) { query += ' AND delivery_date <= ?'; params.push(to_date); }
    if (search) { query += ' AND (so_number LIKE ? OR customer_name LIKE ?)'; params.push('%'+search+'%', '%'+search+'%'); }
    query += ' ORDER BY so_number, delivery_date DESC';

    const orders = db.prepare(query).all(...params);

    // Group by so_number if requested
    if (group_by_so === 'true') {
      const grouped = {};
      orders.forEach(o => {
        if (!grouped[o.so_number]) {
          grouped[o.so_number] = {
            so_number: o.so_number,
            customer_id: o.customer_id,
            customer_name: o.customer_name,
            delivery_date: o.delivery_date,
            bucket_no: o.bucket_no,
            delivery_destination: o.delivery_destination,
            records: [],
            total_plan: 0,
            total_actual: 0,
            statuses: [],
          };
        }
        grouped[o.so_number].records.push(o);
        grouped[o.so_number].total_plan += Number(o.total_qty_plan || 0);
        grouped[o.so_number].total_actual += Number(o.total_qty_actual || 0);
        if (!grouped[o.so_number].statuses.includes(o.status)) {
          grouped[o.so_number].statuses.push(o.status);
        }
      });
      res.json(Object.values(grouped));
    } else {
      res.json(orders);
    }
  } catch (error) {
    logger.error('Get sales orders error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch sales orders' } });
  }
});

// GET sales order by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM sales_orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: { message: 'Sales order not found' } });
    const items = db.prepare('SELECT * FROM so_items WHERE so_id = ? ORDER BY item_number ASC').all(order.id);
    const alerts = db.prepare('SELECT * FROM alerts WHERE so_id = ? ORDER BY created_at DESC').all(order.id);
    res.json({ ...order, items, alerts });
  } catch (error) {
    logger.error('Get sales order error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch sales order' } });
  }
});

// POST create sales order
router.post('/', authenticateToken, authorizeRoles('admin', 'ppic'), (req, res) => {
  try {
    const { so_number, customer_id, customer_name, delivery_date, delivery_destination, delivery_type, remark, items } = req.body;
    logger.info('Create SO received', { so_number, customer_id, customer_name, delivery_date, delivery_type });

    if (!so_number) return res.status(400).json({ error: { message: 'SO Number is required' } });
    if (!customer_id) return res.status(400).json({ error: { message: 'Customer is required' } });
    if (!customer_name) return res.status(400).json({ error: { message: 'Customer name is required' } });
    if (!delivery_date) return res.status(400).json({ error: { message: 'Delivery date is required' } });

    const normalizedSoNumber = so_number.trim();
    const normalizedDate = normalizeDeliveryDate(delivery_date);
    if (!normalizedDate) {
      return res.status(400).json({ error: { message: 'Invalid delivery date' } });
    }

    const validTypes = ['Regular', 'CKD', 'Non Regular'];
    let normalizedType = delivery_type || '';
    let finalRemark = remark || '';

    if (!validTypes.includes(normalizedType)) {
      if (normalizedType) {
        finalRemark = finalRemark ? `${finalRemark}; ${normalizedType}` : normalizedType;
      }
      normalizedType = 'Non Regular';
    }

    const bucketNo = normalizeBucketNo('', normalizedDate);
    const totalQtyPlan = (items || []).reduce((sum, item) => sum + (item.qty_plan || 0), 0);
    const soId = uuidv4();
    const now = new Date().toISOString();

    // Insert SO record
    db.prepare(`
      INSERT INTO sales_orders (id, so_number, customer_id, customer_name, delivery_date, bucket_no, delivery_destination, delivery_type, remark, total_qty_plan, total_qty_actual, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'PENDING', ?, ?)
    `).run(soId, normalizedSoNumber, customer_id, customer_name, normalizedDate, bucketNo, delivery_destination || '', normalizedType, finalRemark, totalQtyPlan, now, now);

    // Insert items using transaction
    const insertedItems = [];
    if (items && items.length > 0) {
      logger.info('Inserting items', { soId, itemCount: items.length });
      const insertItem = db.prepare(`
        INSERT INTO so_items (id, so_id, item_number, model_code, qty_plan, qty_actual, delivery_schedule, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
      `);

      const insertItemsBatch = db.transaction((itemsArray) => {
        for (const item of itemsArray) {
          if (!item.item_number) continue; // Skip items without item_number
          const itemId = uuidv4();
          insertItem.run(
            itemId,
            soId,
            item.item_number || '',
            item.model_code || '',
            item.qty_plan || 0,
            JSON.stringify(item.delivery_schedule || {}),
            now,
            now
          );
          insertedItems.push({ id: itemId, so_id: soId, ...item });
        }
      });

      insertItemsBatch(items);
    }

    logger.info('Sales order created', { soId, soNumber: normalizedSoNumber, itemCount: insertedItems.length, createdBy: req.user.username });
    res.status(201).json({
      id: soId,
      so_number: normalizedSoNumber,
      status: 'PENDING',
      items: insertedItems,
      total_qty_plan: totalQtyPlan,
    });
  } catch (error) {
    logger.error('Create sales order error:', error);
    res.status(500).json({ error: { message: 'Failed to create sales order', details: error.message } });
  }
});

// PATCH update sales order
router.patch('/:id', authenticateToken, authorizeRoles('admin', 'ppic'), (req, res) => {
  try {
    const soId = req.params.id;
    const { so_number, customer_id, delivery_date, delivery_destination, delivery_type, bucket_no, remark, status, items } = req.body;

    const order = db.prepare('SELECT * FROM sales_orders WHERE id = ?').get(soId);
    if (!order) return res.status(404).json({ error: { message: 'Sales order not found' } });

    if (so_number && so_number !== order.so_number) {
      // Check for duplicate only if actually changing
      const existing = db.prepare('SELECT id FROM sales_orders WHERE so_number = ? AND id != ? AND delivery_type = ?').get(so_number, soId, order.delivery_type);
      if (existing) return res.status(409).json({ error: { message: 'SO number already exists for this delivery type' } });
    }

    const updates = [];
    const params = [];

    if (so_number !== undefined && so_number !== order.so_number) { updates.push('so_number = ?'); params.push(so_number); }
    if (customer_id !== undefined && customer_id !== order.customer_id) { updates.push('customer_id = ?'); params.push(customer_id); }
    if (delivery_date !== undefined) {
      const normalizedDate = normalizeDeliveryDate(delivery_date);
      if (normalizedDate && normalizedDate !== order.delivery_date?.slice(0, 10)) {
        updates.push('delivery_date = ?'); params.push(normalizedDate);
        updates.push('bucket_no = ?'); params.push(normalizeBucketNo('', normalizedDate));
      }
    }
    if (delivery_destination !== undefined) { updates.push('delivery_destination = ?'); params.push(delivery_destination); }
    if (delivery_type !== undefined) { updates.push('delivery_type = ?'); params.push(delivery_type); }
    if (bucket_no !== undefined) { updates.push('bucket_no = ?'); params.push(bucket_no); }
    if (remark !== undefined) { updates.push('remark = ?'); params.push(remark); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(soId);
      db.prepare(`UPDATE sales_orders SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    // Handle items update if provided
    let updatedItems = null;
    if (items !== undefined && Array.isArray(items)) {
      updatedItems = updateSoItems(soId, items);
    }

    logger.info('Sales order updated', { soId, soNumber: order.so_number, updatedBy: req.user.username });
    const updated = db.prepare('SELECT * FROM sales_orders WHERE id = ?').get(soId);
    const itemsResult = db.prepare('SELECT * FROM so_items WHERE so_id = ?').all(soId);

    res.json({
      message: 'Sales order updated successfully',
      data: updated,
      items: updatedItems || itemsResult,
    });
  } catch (error) {
    logger.error('Update sales order error:', error);
    res.status(500).json({ error: { message: 'Failed to update sales order' } });
  }
});

// PUT update (legacy, redirects to patch behavior)
router.put('/:id', authenticateToken, authorizeRoles('admin', 'ppic'), (req, res) => {
  // Delegate to PATCH handler
  req.url = '/' + req.params.id;
  router.handle(req, res);
});

// DELETE sales order
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const soId = req.params.id;
    const order = db.prepare('SELECT so_number FROM sales_orders WHERE id = ?').get(soId);
    if (!order) return res.status(404).json({ error: { message: 'Sales order not found' } });

    db.prepare('DELETE FROM sales_orders WHERE id = ?').run(soId);
    logger.info('Sales order deleted', { soId, soNumber: order.so_number, deletedBy: req.user.username });
    res.json({ message: 'Sales order deleted successfully' });
  } catch (error) {
    logger.error('Delete sales order error:', error);
    res.status(500).json({ error: { message: 'Failed to delete sales order' } });
  }
});

// ============ ITEMS CRUD ENDPOINTS ============

// GET items for a sales order
router.get('/:id/items', authenticateToken, (req, res) => {
  try {
    const soId = req.params.id;
    const order = db.prepare('SELECT id FROM sales_orders WHERE id = ?').get(soId);
    if (!order) return res.status(404).json({ error: { message: 'Sales order not found' } });

    const items = db.prepare('SELECT * FROM so_items WHERE so_id = ? ORDER BY item_number ASC').all(soId);
    res.json(items);
  } catch (error) {
    logger.error('Get SO items error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch items' } });
  }
});

// POST add item to sales order
router.post('/:id/items', authenticateToken, authorizeRoles('admin', 'ppic'), (req, res) => {
  try {
    const soId = req.params.id;
    const { item_number, model_code, qty_plan, delivery_schedule } = req.body;

    const order = db.prepare('SELECT id FROM sales_orders WHERE id = ?').get(soId);
    if (!order) return res.status(404).json({ error: { message: 'Sales order not found' } });

    if (!item_number) return res.status(400).json({ error: { message: 'Item number is required' } });

    const itemId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO so_items (id, so_id, item_number, model_code, qty_plan, qty_actual, delivery_schedule, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
    `).run(itemId, soId, item_number, model_code || '', qty_plan || 0, JSON.stringify(delivery_schedule || {}), now, now);

    // Update total_qty_plan on SO
    const totalPlan = db.prepare('SELECT SUM(qty_plan) as total FROM so_items WHERE so_id = ?').get(soId);
    db.prepare('UPDATE sales_orders SET total_qty_plan = ?, updated_at = ? WHERE id = ?').run(totalPlan.total || 0, now, soId);

    logger.info('SO item added', { soId, itemId, item_number, createdBy: req.user.username });
    const newItem = db.prepare('SELECT * FROM so_items WHERE id = ?').get(itemId);
    res.status(201).json(newItem);
  } catch (error) {
    logger.error('Add SO item error:', error);
    res.status(500).json({ error: { message: 'Failed to add item' } });
  }
});

// PATCH update item
router.patch('/:soId/items/:itemId', authenticateToken, authorizeRoles('admin', 'ppic'), (req, res) => {
  try {
    const { soId, itemId } = req.params;
    const { item_number, model_code, qty_plan, qty_actual, delivery_schedule } = req.body;

    const item = db.prepare('SELECT * FROM so_items WHERE id = ? AND so_id = ?').get(itemId, soId);
    if (!item) return res.status(404).json({ error: { message: 'Item not found' } });

    const updates = [];
    const params = [];

    if (item_number !== undefined) { updates.push('item_number = ?'); params.push(item_number); }
    if (model_code !== undefined) { updates.push('model_code = ?'); params.push(model_code); }
    if (qty_plan !== undefined) { updates.push('qty_plan = ?'); params.push(qty_plan); }
    if (qty_actual !== undefined) { updates.push('qty_actual = ?'); params.push(qty_actual); }
    if (delivery_schedule !== undefined) { updates.push('delivery_schedule = ?'); params.push(JSON.stringify(delivery_schedule)); }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(itemId);
      db.prepare(`UPDATE so_items SET ${updates.join(', ')} WHERE id = ?`).run(...params);

      // Update total_qty_plan on SO
      const totalPlan = db.prepare('SELECT SUM(qty_plan) as total FROM so_items WHERE so_id = ?').get(soId);
      db.prepare('UPDATE sales_orders SET total_qty_plan = ?, updated_at = ? WHERE id = ?').run(totalPlan.total || 0, new Date().toISOString(), soId);
    }

    logger.info('SO item updated', { soId, itemId, updatedBy: req.user.username });
    const updated = db.prepare('SELECT * FROM so_items WHERE id = ?').get(itemId);
    res.json(updated);
  } catch (error) {
    logger.error('Update SO item error:', error);
    res.status(500).json({ error: { message: 'Failed to update item' } });
  }
});

// PUT update item (same as PATCH for simplicity)
router.put('/:soId/items/:itemId', authenticateToken, authorizeRoles('admin', 'ppic'), (req, res) => {
  // Delegate to PATCH
  req.url = '/' + req.params.soId + '/items/' + req.params.itemId;
  router.handle(req, res);
});

// DELETE item
router.delete('/:soId/items/:itemId', authenticateToken, authorizeRoles('admin', 'ppic'), (req, res) => {
  try {
    const { soId, itemId } = req.params;

    const item = db.prepare('SELECT * FROM so_items WHERE id = ? AND so_id = ?').get(itemId, soId);
    if (!item) return res.status(404).json({ error: { message: 'Item not found' } });

    db.prepare('DELETE FROM so_items WHERE id = ?').run(itemId);

    // Update total_qty_plan on SO
    const totalPlan = db.prepare('SELECT SUM(qty_plan) as total FROM so_items WHERE so_id = ?').get(soId);
    db.prepare('UPDATE sales_orders SET total_qty_plan = ?, updated_at = ? WHERE id = ?').run(totalPlan.total || 0, new Date().toISOString(), soId);

    logger.info('SO item deleted', { soId, itemId, deletedBy: req.user.username });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    logger.error('Delete SO item error:', error);
    res.status(500).json({ error: { message: 'Failed to delete item' } });
  }
});

// Helper function to update items in batch
function updateSoItems(soId, items) {
  // Delete existing items
  db.prepare('DELETE FROM so_items WHERE so_id = ?').run(soId);

  // Insert new items
  const now = new Date().toISOString();
  const insertItem = db.prepare(`
    INSERT INTO so_items (id, so_id, item_number, model_code, qty_plan, qty_actual, delivery_schedule, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
  `);

  const insertedItems = [];
  for (const item of items) {
    if (!item.item_number) continue;
    const itemId = uuidv4();
    insertItem.run(
      itemId,
      soId,
      item.item_number,
      item.model_code || '',
      item.qty_plan || 0,
      JSON.stringify(item.delivery_schedule || {}),
      now,
      now
    );
    insertedItems.push({ id: itemId, so_id: soId, ...item });
  }

  // Update total_qty_plan on SO
  const totalPlan = db.prepare('SELECT SUM(qty_plan) as total FROM so_items WHERE so_id = ?').get(soId);
  db.prepare('UPDATE sales_orders SET total_qty_plan = ?, updated_at = ? WHERE id = ?').run(totalPlan.total || 0, now, soId);

  return insertedItems;
}

export default router;