import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';
const router = express.Router();
// Get audit logs
router.get('/', authenticateToken, (req, res) => {
  try {
    const { scope, action, from_date, to_date, limit = 100 } = req.query;
    let query = 'SELECT * FROM so_audit_logs WHERE 1=1';
    const params = [];
    if (scope) { query += ' AND scope = ?'; params.push(scope); }
    if (action) { query += ' AND action = ?'; params.push(action); }
    if (from_date) { query += ' AND at >= ?'; params.push(from_date); }
    if (to_date) { query += ' AND at <= ?'; params.push(to_date); }
    query += ' ORDER BY at DESC LIMIT ?';
    params.push(parseInt(limit));
    const logs = db.prepare(query).all(...params);
    res.json(logs);
  } catch (error) {
    logger.error('Get audit logs error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch audit logs' } });
  }
});
export default router;
