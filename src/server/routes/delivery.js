import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import logger from '../utils/logger.js';
const router = express.Router();
// Start delivery batch
router.post('/start-batch', authenticateToken, authorizeRoles('admin', 'ppic', 'warehouse'), (req, res) => {
  try {
    const { so_item_id, item_card_barcode, qty_total } = req.body;
    if (!so_item_id || !item_card_barcode || !qty_total) {
      return res.status(400).json({ error: { message: 'SO item ID, barcode, and quantity required' } });
    }
    const soItem = db.prepare('SELECT * FROM so_items WHERE id = ?').get(so_item_id);
    if (!soItem) return res.status(404).json({ error: { message: 'SO item not found' } });
    const existingBatch = db.prepare("SELECT id FROM delivery_batches WHERE so_item_id = ? AND status = 'IN_PROGRESS'").get(so_item_id);
    if (existingBatch) return res.status(409).json({ error: { message: 'Active batch already exists' } });
    const batchId = uuidv4();
    const product = db.prepare('SELECT box_capacity FROM product_master WHERE model_code = ?').get(soItem.model_code);
    const boxCapacity = product ? product.box_capacity : 10;
    const boxesRequired = Math.ceil(qty_total / boxCapacity);
    const now = new Date().toISOString();
    db.prepare("INSERT INTO delivery_batches (id, so_item_id, item_card_barcode, qty_total, boxes_required, status, started_at, created_by) VALUES (?, ?, ?, ?, ?, 'IN_PROGRESS', ?, ?)").run(batchId, so_item_id, item_card_barcode, qty_total, boxesRequired, now, req.user.id);
    logger.info('Delivery batch started', { batchId, soItemId: so_item_id, startedBy: req.user.username });
    const newBatch = db.prepare('SELECT * FROM delivery_batches WHERE id = ?').get(batchId);
    res.status(201).json(newBatch);
  } catch (error) {
    logger.error('Start batch error:', error);
    res.status(500).json({ error: { message: 'Failed to start batch' } });
  }
});
// Scan unit into a box
router.post('/scan-unit', authenticateToken, authorizeRoles('admin', 'ppic', 'warehouse'), (req, res) => {
  try {
    const { batch_id, box_id, qr_code, serial_number, model_code } = req.body;
    if (!batch_id || !box_id || !qr_code || !serial_number || !model_code) {
      return res.status(400).json({ error: { message: 'Batch ID, box ID, QR code, serial number, and model code are required' } });
    }
    const batch = db.prepare('SELECT * FROM delivery_batches WHERE id = ?').get(batch_id);
    if (!batch) return res.status(404).json({ error: { message: 'Batch not found' } });
    if (batch.status !== 'IN_PROGRESS') return res.status(400).json({ error: { message: 'Batch is not in progress' } });
    const box = db.prepare('SELECT * FROM delivery_boxes WHERE id = ? AND batch_id = ?').get(box_id, batch_id);
    if (!box) return res.status(404).json({ error: { message: 'Box not found in this batch' } });
    if (box.status === 'SEALED') return res.status(400).json({ error: { message: 'Box is already sealed' } });
    const existing = db.prepare('SELECT id FROM scanned_units WHERE qr_code = ? OR serial_number = ?').get(qr_code, serial_number);
    if (existing) return res.status(409).json({ error: { message: 'QR code or serial number already scanned' } });
    const prefixValid = 1; // TODO: implement prefix validation logic
    const scannedAt = new Date().toISOString();
    const scanId = uuidv4();
    db.prepare("INSERT INTO scanned_units (id, box_id, qr_code, serial_number, model_code, prefix_valid, scanned_at, scanned_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(scanId, box_id, qr_code, serial_number, model_code, prefixValid, scannedAt, req.user.id);
    const newScanned = db.prepare('SELECT * FROM scanned_units WHERE id = ?').get(scanId);
    const updatedQtyScanned = db.prepare('SELECT COUNT(*) as count FROM scanned_units WHERE box_id = ?').get(box_id).count;
    db.prepare('UPDATE delivery_boxes SET qty_actual = ? WHERE id = ?').run(updatedQtyScanned, box_id);
    const updatedBatchScanned = db.prepare('SELECT SUM(qty_actual) as total FROM delivery_boxes WHERE batch_id = ?').get(batch_id).total || 0;
    db.prepare('UPDATE delivery_batches SET qty_scanned = ? WHERE id = ?').run(updatedBatchScanned, batch_id);
    logger.info('Unit scanned', { scanId, batchId, boxId, scannedBy: req.user.username });
    res.status(201).json({ scan: newScanned, box: { id: box_id, qty_actual: updatedQtyScanned }, batch: { id: batch_id, qty_scanned: updatedBatchScanned } });
  } catch (error) {
    logger.error('Scan unit error:', error);
    res.status(500).json({ error: { message: 'Failed to scan unit' } });
  }
});
// Seal a box
router.post('/seal-box', authenticateToken, authorizeRoles('admin', 'ppic', 'warehouse'), (req, res) => {
  try {
    const { box_id } = req.body;
    if (!box_id) return res.status(400).json({ error: { message: 'Box ID is required' } });
    const box = db.prepare('SELECT * FROM delivery_boxes WHERE id = ?').get(box_id);
    if (!box) return res.status(404).json({ error: { message: 'Box not found' } });
    if (box.status === 'SEALED') return res.status(400).json({ error: { message: 'Box is already sealed' } });
    const batch = db.prepare('SELECT * FROM delivery_batches WHERE id = ?').get(box.batch_id);
    if (!batch) return res.status(404).json({ error: { message: 'Batch not found' } });
    if (batch.status !== 'IN_PROGRESS') return res.status(400).json({ error: { message: 'Batch is not in progress' } });
    const sealedAt = new Date().toISOString();
    db.prepare('UPDATE delivery_boxes SET status = "SEALED", sealed_at = ?, sealed_by = ? WHERE id = ?').run(sealedAt, req.user.id, box_id);
    logger.info('Box sealed', { boxId: box_id, sealedBy: req.user.username });
    const updatedBox = db.prepare('SELECT * FROM delivery_boxes WHERE id = ?').get(box_id);
    res.json(updatedBox);
  } catch (error) {
    logger.error('Seal box error:', error);
    res.status(500).json({ error: { message: 'Failed to seal box' } });
  }
});
// Complete delivery batch
router.post('/complete-batch', authenticateToken, authorizeRoles('admin', 'ppic', 'warehouse'), (req, res) => {
  try {
    const { batch_id } = req.body;
    if (!batch_id) return res.status(400).json({ error: { message: 'Batch ID is required' } });
    const batch = db.prepare('SELECT * FROM delivery_batches WHERE id = ?').get(batch_id);
    if (!batch) return res.status(404).json({ error: { message: 'Batch not found' } });
    if (batch.status !== 'IN_PROGRESS') return res.status(400).json({ error: { message: 'Batch is not in progress' } });
    // Check if all boxes are sealed
    const boxes = db.prepare('SELECT * FROM delivery_boxes WHERE batch_id = ?').all(batch_id);
    const allSealed = boxes.every(box => box.status === 'SEALED');
    if (!allSealed) return res.status(400).json({ error: { message: 'Not all boxes are sealed' } });
    const completedAt = new Date().toISOString();
    db.prepare('UPDATE delivery_batches SET status = "COMPLETED", completed_at = ? WHERE id = ?').run(completedAt, batch_id);
    logger.info('Delivery batch completed', { batchId: batch_id, completedBy: req.user.username });
    const updatedBatch = db.prepare('SELECT * FROM delivery_batches WHERE id = ?').get(batch_id);
    res.json(updatedBatch);
  } catch (error) {
    logger.error('Complete batch error:', error);
    res.status(500).json({ error: { message: 'Failed to complete batch' } });
  }
});
// Get batch by ID
router.get('/batches/:id', authenticateToken, (req, res) => {
  try {
    const batch = db.prepare('SELECT * FROM delivery_batches WHERE id = ?').get(req.params.id);
    if (!batch) return res.status(404).json({ error: { message: 'Batch not found' } });
    const soItem = db.prepare('SELECT * FROM so_items WHERE id = ?').get(batch.so_item_id);
    const so = db.prepare('SELECT * FROM sales_orders WHERE id = ?').get(soItem.so_id);
    const boxes = db.prepare('SELECT * FROM delivery_boxes WHERE batch_id = ? ORDER BY box_number ASC').all(batch.id);
    const scannedUnits = db.prepare('SELECT COUNT(*) as total FROM scanned_units WHERE box_id IN (SELECT id FROM delivery_boxes WHERE batch_id = ?)').get(batch.id).total || 0;
    res.json({ ...batch, soItem, so, boxes, scannedUnits });
  } catch (error) {
    logger.error('Get batch error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch batch' } });
  }
});
export default router;
