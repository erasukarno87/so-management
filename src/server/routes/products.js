import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get all products
router.get('/', authenticateToken, (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM product_master ORDER BY model_code ASC').all();
    res.json(products);
  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch products' } });
  }
});

// Get product by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM product_master WHERE id = ?').get(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: { message: 'Product not found' } });
    }
    
    res.json(product);
  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch product' } });
  }
});

// Create product (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { part_number, model_code, prefix, box_capacity, description } = req.body;

    if (!part_number || !model_code || !prefix) {
      return res.status(400).json({ 
        error: { message: 'Part number, model code, and prefix are required' } 
      });
    }

    if (box_capacity && (box_capacity < 1 || box_capacity > 1000)) {
      return res.status(400).json({ 
        error: { message: 'Box capacity must be between 1 and 1000' } 
      });
    }

    // Check if model code already exists
    const existingProduct = db.prepare('SELECT id FROM product_master WHERE model_code = ?').get(model_code);
    if (existingProduct) {
      return res.status(409).json({ error: { message: 'Model code already exists' } });
    }

    const productId = uuidv4();

    // Try to insert with created_at, fall back to without it
    try {
      db.prepare(
        'INSERT INTO product_master (id, part_number, model_code, prefix, box_capacity, description, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime(\'now\'))'
      ).run(productId, part_number, model_code, prefix.toUpperCase(), box_capacity || 10, description || '');
    } catch (insertError) {
      // Fallback for tables without created_at column
      if (insertError.message.includes('created_at')) {
        db.prepare(
          'INSERT INTO product_master (id, part_number, model_code, prefix, box_capacity, description) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(productId, part_number, model_code, prefix.toUpperCase(), box_capacity || 10, description || '');
      } else {
        throw insertError;
      }
    }

    logger.info('Product created', { productId, model_code, createdBy: req.user.username });

    const newProduct = db.prepare('SELECT * FROM product_master WHERE id = ?').get(productId);
    res.status(201).json(newProduct);
  } catch (error) {
    logger.error('Create product error:', error);
    res.status(500).json({ error: { message: 'Failed to create product' } });
  }
});

// Update product (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { part_number, model_code, prefix, box_capacity, description } = req.body;
    const productId = req.params.id;

    const product = db.prepare('SELECT id FROM product_master WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: { message: 'Product not found' } });
    }

    if (box_capacity && (box_capacity < 1 || box_capacity > 1000)) {
      return res.status(400).json({ 
        error: { message: 'Box capacity must be between 1 and 1000' } 
      });
    }

    const updates = [];
    const values = [];

    if (part_number !== undefined) {
      updates.push('part_number = ?');
      values.push(part_number);
    }
    if (model_code !== undefined) {
      updates.push('model_code = ?');
      values.push(model_code);
    }
    if (prefix !== undefined) {
      updates.push('prefix = ?');
      values.push(prefix.toUpperCase());
    }
    if (box_capacity !== undefined) {
      updates.push('box_capacity = ?');
      values.push(box_capacity);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: { message: 'No fields to update' } });
    }

    updates.push('updated_at = datetime(\'now\')');
    values.push(productId);

    db.prepare(`UPDATE product_master SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    logger.info('Product updated', { productId, updatedBy: req.user.username });

    const updatedProduct = db.prepare('SELECT * FROM product_master WHERE id = ?').get(productId);
    res.json(updatedProduct);
  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({ error: { message: 'Failed to update product' } });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const productId = req.params.id;

    const product = db.prepare('SELECT model_code FROM product_master WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: { message: 'Product not found' } });
    }

    // Check if product is used in any SO items
    const poItemCount = db.prepare('SELECT COUNT(*) as count FROM so_items WHERE model_code = ?').get(product.model_code);
    if (poItemCount.count > 0) {
      return res.status(400).json({ 
        error: { 
          message: 'Cannot delete product used in sales orders',
          associatedPOItems: poItemCount.count 
        } 
      });
    }

    db.prepare('DELETE FROM product_master WHERE id = ?').run(productId);

    logger.info('Product deleted', { productId, model_code: product.model_code, deletedBy: req.user.username });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Delete product error:', error);
    res.status(500).json({ error: { message: 'Failed to delete product' } });
  }
});

export default router;