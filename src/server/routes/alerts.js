import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import db from '../db/index.js';
const router = express.Router();
// Get all alerts
router.get('/', authenticateToken, (req, res) => {
  try {
    const { is_read, severity, limit = 50 } = req.query;
    let query = 'SELECT * FROM alerts WHERE 1=1';
    const params = [];
    if (is_read !== undefined) { query += ' AND is_read = ?'; params.push(is_read); }
    if (severity) { query += ' AND severity = ?'; params.push(severity); }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    const alerts = db.prepare(query).all(...params);
    res.json(alerts);
  } catch (error) {
    logger.error('Get alerts error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch alerts' } });
  }
});
// Mark alert as read
router.patch('/:id/read', authenticateToken, (req, res) => {
  try {
    const alertId = req.params.id;
    const alert = db.prepare('SELECT id FROM alerts WHERE id = ?').get(alertId);
    if (!alert) return res.status(404).json({ error: { message: 'Alert not found' } });
    db.prepare('UPDATE alerts SET is_read = 1 WHERE id = ?').run(alertId);
    logger.info('Alert marked as read', { alertId, updatedBy: req.user.username });
    res.json({ message: 'Alert marked as read' });
  } catch (error) {
    logger.error('Mark alert as read error:', error);
    res.status(500).json({ error: { message: 'Failed to mark alert as read' } });
  }
});
// Get unread count
router.get('/unread-count', authenticateToken, (req, res) => {
  try {
    const { count } = db.prepare('SELECT COUNT(*) as count FROM alerts WHERE is_read = 0').get();
    res.json({ count });
  } catch (error) {
    logger.error('Get unread count error:', error);
    res.status(500).json({ error: { message: 'Failed to get unread count' } });
  }
});
export default router;
