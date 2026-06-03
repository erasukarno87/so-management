import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('admin', 'ppic'), (req, res) => {
  try {
    const types = db.prepare('SELECT * FROM delivery_types ORDER BY sort_order').all();
    res.json(types);
  } catch (error) {
    logger.error('Get delivery types error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch delivery types' } });
  }
});

router.get('/:id', authenticateToken, authorizeRoles('admin', 'ppic'), (req, res) => {
  try {
    const type = db.prepare('SELECT * FROM delivery_types WHERE id = ?').get(req.params.id);
    if (!type) {
      return res.status(404).json({ error: { message: 'Delivery type not found' } });
    }
    res.json(type);
  } catch (error) {
    logger.error('Get delivery type error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch delivery type' } });
  }
});

router.post('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name) {
      return res.status(400).json({ error: { message: 'Name is required' } });
    }
    const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM delivery_types').get();
    const sortOrder = (maxOrder?.max || 0) + 1;
    const id = uuidv4();
    db.prepare('INSERT INTO delivery_types (id, code, name, sort_order) VALUES (?, ?, ?, ?)').run(id, code || null, name, sortOrder);
    logger.info('Delivery type created', { id, name, code });
    const newType = db.prepare('SELECT * FROM delivery_types WHERE id = ?').get(id);
    res.status(201).json(newType);
  } catch (error) {
    logger.error('Create delivery type error:', error);
    res.status(500).json({ error: { message: 'Failed to create delivery type' } });
  }
});

router.patch('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, sort_order, is_active } = req.body;
    const type = db.prepare('SELECT * FROM delivery_types WHERE id = ?').get(id);
    if (!type) {
      return res.status(404).json({ error: { message: 'Delivery type not found' } });
    }
    const updates = [];
    const values = [];
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (code !== undefined) { updates.push('code = ?'); values.push(code); }
    if (sort_order !== undefined) { updates.push('sort_order = ?'); values.push(sort_order); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }
    if (updates.length === 0) {
      return res.status(400).json({ error: { message: 'No fields to update' } });
    }
    values.push(id);
    db.prepare('UPDATE delivery_types SET ' + updates.join(', ') + ' WHERE id = ?').run(...values);
    const updated = db.prepare('SELECT * FROM delivery_types WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    logger.error('Update delivery type error:', error);
    res.status(500).json({ error: { message: 'Failed to update delivery type' } });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const type = db.prepare('SELECT * FROM delivery_types WHERE id = ?').get(id);
    if (!type) {
      return res.status(404).json({ error: { message: 'Delivery type not found' } });
    }
    const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers WHERE delivery_type_id = ?').get(id);
    if (customerCount.count > 0) {
      return res.status(400).json({ error: { message: `${customerCount.count} customers are using this delivery type` } });
    }
    db.prepare('DELETE FROM delivery_types WHERE id = ?').run(id);
    logger.info('Delivery type deleted', { id, name: type.name });
    res.json({ message: 'Delivery type deleted successfully' });
  } catch (error) {
    logger.error('Delete delivery type error:', error);
    res.status(500).json({ error: { message: 'Failed to delete delivery type' } });
  }
});

export default router;