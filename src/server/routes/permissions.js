import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import logger from '../utils/logger.js';
const router = express.Router();
// Get permission matrix
router.get('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const permissions = db.prepare('SELECT * FROM role_permission_matrix ORDER BY sort_order ASC').all();
    res.json(permissions);
  } catch (error) {
    logger.error('Get permissions error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch permissions' } });
  }
});
// Update permission matrix (admin only)
router.put('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { permissions } = req.body; // Array of { module, admin, ppic, warehouse, qc, viewer }
    if (!Array.isArray(permissions)) return res.status(400).json({ error: { message: 'Permissions must be an array' } });
    const tx = db.transaction(() => {
      for (const perm of permissions) {
        db.prepare("UPDATE role_permission_matrix SET admin = ?, ppic = ?, warehouse = ?, qc = ?, viewer = ? WHERE module = ?")
          .run(perm.admin, perm.ppic, perm.warehouse, perm.qc, perm.viewer, perm.module);
      }
    });
    tx();
    logger.info('Permissions updated', { updatedBy: req.user.username });
    res.json({ message: 'Permissions updated successfully' });
  } catch (error) {
    logger.error('Update permissions error:', error);
    res.status(500).json({ error: { message: 'Failed to update permissions' } });
  }
});
export default router;
