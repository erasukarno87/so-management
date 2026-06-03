import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get all users
router.get('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, name, role, password_plain, created_at, updated_at, last_login FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch users' } });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, name, role, password_plain, created_at, updated_at, last_login FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    res.json(user);
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch user' } });
  }
});

// Create user
router.post('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { username, name, role, password } = req.body;
    if (!username || !name || !role) {
      return res.status(400).json({ error: { message: 'Username, name, and role are required' } });
    }
    const validRoles = ['admin', 'ppic', 'warehouse', 'qc', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: { message: 'Invalid role' } });
    }
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(409).json({ error: { message: 'Username already exists' } });
    }
    const userId = uuidv4();
    const defaultPassword = password || 'changeme';
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
    db.prepare("INSERT INTO users (id, username, name, role, password, password_plain, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))").run(userId, username, name, role, hashedPassword, defaultPassword);
    logger.info('User created', { userId, username, role, createdBy: req.user.username });
    const newUser = db.prepare('SELECT id, username, name, role, password_plain, created_at FROM users WHERE id = ?').get(userId);
    res.status(201).json(newUser);
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({ error: { message: 'Failed to create user' } });
  }
});

// Helper function to retry on SQLITE_BUSY (synchronous)
function executeWithRetry(stmt, ...params) {
  const maxRetries = 5;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return stmt.run(...params);
    } catch (error) {
      if (error.code !== 'SQLITE_BUSY') throw error;
      // Busy wait for 50ms
      const end = Date.now() + 50;
      while (Date.now() < end) {}
    }
  }
  throw new Error('Database busy after retries');
}

// Update user
router.patch('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { name, role } = req.body;
    const userId = req.params.id;
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    const updates = [];
    const values = [];
    if (name) { updates.push('name = ?'); values.push(name); }
    if (role) {
      const validRoles = ['admin', 'ppic', 'warehouse', 'qc', 'viewer'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: { message: 'Invalid role' } });
      }
      updates.push('role = ?');
      values.push(role);
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: { message: 'No fields to update' } });
    }
    updates.push("updated_at = datetime('now')");
    values.push(userId);

    const updateStmt = db.prepare('UPDATE users SET ' + updates.join(', ') + ' WHERE id = ?');
    executeWithRetry(updateStmt, ...values);

    logger.info('User updated', { userId, updatedBy: req.user.username });
    const updated = db.prepare('SELECT id, username, name, role, created_at, updated_at FROM users WHERE id = ?').get(userId);
    res.json(updated);
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({ error: { message: 'Failed to update user' } });
  }
});

// Delete user
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const userId = req.params.id;
    const user = db.prepare('SELECT username FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    logger.info('User deleted', { userId, username: user.username, deletedBy: req.user.username });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ error: { message: 'Failed to delete user' } });
  }
});

// Reset user password
router.post('/:id/reset-password', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const userId = req.params.id;
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    const password = user.username + '123';
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare("UPDATE users SET password = ?, password_plain = ?, updated_at = datetime('now') WHERE id = ?").run(hashedPassword, password, userId);
    logger.info('Password reset', { username: user.username, resetBy: req.user.username });
    res.json({ success: true, message: 'Password reset', newPassword: password });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ error: { message: 'Failed to reset password' } });
  }
});

// Get password hash
router.get('/:id/password', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    res.json({ username: user.username, message: 'Use toggle to show/hide' });
  } catch (error) {
    logger.error('View password error:', error);
    res.status(500).json({ error: { message: 'Failed to view password' } });
  }
});

// Reset all passwords
router.post('/reset-all-passwords', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const users = db.prepare('SELECT id, username FROM users').all();
    const results = users.map(user => {
      const password = user.username + '123';
      const hashed = bcrypt.hashSync(password, 10);
      db.prepare("UPDATE users SET password = ?, password_plain = ?, updated_at = datetime('now') WHERE id = ?").run(hashed, password, user.id);
      logger.info('Password reset for user', { username: user.username, resetBy: req.user.username });
      return { username: user.username, password };
    });
    res.json({ message: `Reset ${results.length} passwords`, passwords: results });
  } catch (error) {
    logger.error('Bulk reset error:', error);
    res.status(500).json({ error: { message: 'Failed to reset passwords' } });
  }
});

// Populate password_plain for existing users
router.post('/populate-passwords', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const users = db.prepare('SELECT id, username FROM users').all();
    const count = users.length;
    for (const user of users) {
      const password = user.username + '123';
      db.prepare('UPDATE users SET password_plain = ? WHERE id = ?').run(password, user.id);
    }
    res.json({ message: `Populated ${count} passwords`, count });
  } catch (error) {
    logger.error('Populate error:', error);
    res.status(500).json({ error: { message: 'Failed to populate passwords' } });
  }
});

export default router;