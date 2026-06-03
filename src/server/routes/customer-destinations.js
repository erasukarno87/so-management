import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get all destinations for a customer
router.get('/customer/:customerId', authenticateToken, authorizeRoles('admin', 'ppic'), (req, res) => {
  try {
    const { customerId } = req.params;
    const destinations = db.prepare(
      'SELECT * FROM customer_destinations WHERE customer_id = ? ORDER BY is_default DESC, name ASC'
    ).all(customerId);
    res.json(destinations);
  } catch (error) {
    logger.error('Get destinations error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch destinations' } });
  }
});

// Get all destinations (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const destinations = db.prepare(`
      SELECT cd.*, c.name as customer_name
      FROM customer_destinations cd
      LEFT JOIN customers c ON cd.customer_id = c.id
      ORDER BY c.name, cd.name
    `).all();
    res.json(destinations);
  } catch (error) {
    logger.error('Get all destinations error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch destinations' } });
  }
});

// Get destination by ID
router.get('/:id', authenticateToken, authorizeRoles('admin', 'ppic'), (req, res) => {
  try {
    const destination = db.prepare(`
      SELECT cd.*, c.name as customer_name
      FROM customer_destinations cd
      LEFT JOIN customers c ON cd.customer_id = c.id
      WHERE cd.id = ?
    `).get(req.params.id);

    if (!destination) {
      return res.status(404).json({ error: { message: 'Destination not found' } });
    }

    res.json(destination);
  } catch (error) {
    logger.error('Get destination error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch destination' } });
  }
});

// Create destination
router.post('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { customer_id, name, address, contact_person, phone, delivery_types, is_default } = req.body;

    if (!customer_id || !name) {
      return res.status(400).json({ error: { message: 'Customer ID and name are required' } });
    }

    // Check if customer exists
    const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(customer_id);
    if (!customer) {
      return res.status(404).json({ error: { message: 'Customer not found' } });
    }

    // If setting as default, remove default from other destinations
    if (is_default) {
      db.prepare('UPDATE customer_destinations SET is_default = 0 WHERE customer_id = ?').run(customer_id);
    }

    // Parse delivery_types from JSON if provided
    const deliveryTypesJson = delivery_types ? JSON.stringify(delivery_types) : '["Regular","CKD","Non Regular"]';

    const id = uuidv4();
    db.prepare(`
      INSERT INTO customer_destinations (id, customer_id, name, address, contact_person, phone, delivery_types, is_default, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(id, customer_id, name, address || '', contact_person || '', phone || '', deliveryTypesJson, is_default ? 1 : 0);

    logger.info('Destination created', { id, customer_id, name, createdBy: req.user.username });

    const newDestination = db.prepare('SELECT * FROM customer_destinations WHERE id = ?').get(id);
    res.status(201).json(newDestination);
  } catch (error) {
    logger.error('Create destination error:', error);
    res.status(500).json({ error: { message: 'Failed to create destination' } });
  }
});

// Update destination
router.patch('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, contact_person, phone, is_default } = req.body;

    const destination = db.prepare('SELECT id, customer_id FROM customer_destinations WHERE id = ?').get(id);
    if (!destination) {
      return res.status(404).json({ error: { message: 'Destination not found' } });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    if (contact_person !== undefined) {
      updates.push('contact_person = ?');
      values.push(contact_person);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (is_default !== undefined) {
      // If setting as default, remove default from other destinations first
      if (is_default) {
        db.prepare('UPDATE customer_destinations SET is_default = 0 WHERE customer_id = ?').run(destination.customer_id);
      }
      updates.push('is_default = ?');
      values.push(is_default ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: { message: 'No fields to update' } });
    }

    updates.push('updated_at = datetime(\'now\')');
    values.push(id);

    db.prepare(`UPDATE customer_destinations SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    logger.info('Destination updated', { id, updatedBy: req.user.username });

    const updatedDestination = db.prepare('SELECT * FROM customer_destinations WHERE id = ?').get(id);
    res.json(updatedDestination);
  } catch (error) {
    logger.error('Update destination error:', error);
    res.status(500).json({ error: { message: 'Failed to update destination' } });
  }
});

// Delete destination
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { id } = req.params;

    const destination = db.prepare('SELECT id, name, customer_id FROM customer_destinations WHERE id = ?').get(id);
    if (!destination) {
      return res.status(404).json({ error: { message: 'Destination not found' } });
    }

    db.prepare('DELETE FROM customer_destinations WHERE id = ?').run(id);

    logger.info('Destination deleted', { id, name: destination.name, deletedBy: req.user.username });

    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    logger.error('Delete destination error:', error);
    res.status(500).json({ error: { message: 'Failed to delete destination' } });
  }
});

// Set destination as default
router.post('/:id/set-default', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { id } = req.params;

    const destination = db.prepare('SELECT id, customer_id FROM customer_destinations WHERE id = ?').get(id);
    if (!destination) {
      return res.status(404).json({ error: { message: 'Destination not found' } });
    }

    // Remove default from all destinations for this customer
    db.prepare('UPDATE customer_destinations SET is_default = 0 WHERE customer_id = ?').run(destination.customer_id);

    // Set this destination as default
    db.prepare('UPDATE customer_destinations SET is_default = 1, updated_at = datetime(\'now\') WHERE id = ?').run(id);

    logger.info('Destination set as default', { id, customer_id: destination.customer_id });

    res.json({ message: 'Destination set as default successfully' });
  } catch (error) {
    logger.error('Set default destination error:', error);
    res.status(500).json({ error: { message: 'Failed to set destination as default' } });
  }
});

export default router;