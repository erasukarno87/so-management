import express from 'express';
import db from '../db/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /api/reports/delivery-summary
router.get('/delivery-summary', authenticateToken, (req, res) => {
  try {
    const summary = db.prepare(`
      SELECT
        COUNT(DISTINCT po.id) as total_orders,
        SUM(po.total_qty_plan) as total_plan_qty,
        SUM(po.total_qty_actual) as total_actual_qty,
        SUM(CASE WHEN po.status = 'PENDING' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN po.status = 'PARTIAL' THEN 1 ELSE 0 END) as partial_count,
        SUM(CASE WHEN po.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_count,
        COUNT(DISTINCT dbatch.id) as total_batches,
        SUM(CASE WHEN dbatch.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_batches,
        COUNT(DISTINCT scan.id) as total_scanned_units,
        COUNT(DISTINCT dbox.id) as total_boxes,
        SUM(CASE WHEN dbox.status = 'SEALED' THEN 1 ELSE 0 END) as sealed_boxes
      FROM sales_orders po
      LEFT JOIN so_items poi ON poi.so_id = po.id
      LEFT JOIN delivery_batches dbatch ON dbatch.so_item_id = poi.id
      LEFT JOIN delivery_boxes dbox ON dbox.batch_id = dbatch.id
      LEFT JOIN scanned_units scan ON scan.box_id = dbox.id
    `).get();

    const byCustomer = db.prepare(`
      SELECT
        po.customer_name as customer,
        COUNT(DISTINCT po.id) as order_count,
        SUM(po.total_qty_plan) as plan_qty,
        SUM(po.total_qty_actual) as actual_qty,
        ROUND(CAST(SUM(po.total_qty_actual) AS FLOAT) / NULLIF(SUM(po.total_qty_plan), 0) * 100, 1) as fulfillment_rate
      FROM sales_orders po
      GROUP BY po.customer_name
      ORDER BY order_count DESC
      LIMIT 10
    `).all();

    const byDate = db.prepare(`
      SELECT
        DATE(po.delivery_date) as delivery_date,
        COUNT(*) as order_count,
        SUM(po.total_qty_plan) as plan_qty,
        SUM(po.total_qty_actual) as actual_qty
      FROM sales_orders po
      WHERE po.delivery_date >= DATE('now', '-30 days')
      GROUP BY DATE(po.delivery_date)
      ORDER BY delivery_date DESC
    `).all();

    res.json({
      summary,
      byCustomer,
      byDate,
    });
  } catch (error) {
    logger.error('Delivery summary error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch delivery summary' } });
  }
});

// GET /api/reports/so-status
router.get('/so-status', authenticateToken, (req, res) => {
  try {
    const overview = db.prepare(`
      SELECT
        COUNT(*) as total_so,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'PARTIAL' THEN 1 ELSE 0 END) as partial,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(total_qty_plan) as total_plan,
        SUM(total_qty_actual) as total_actual,
        MIN(delivery_date) as earliest_delivery,
        MAX(delivery_date) as latest_delivery
      FROM sales_orders
    `).get();

    const byCustomer = db.prepare(`
      SELECT
        po.customer_name,
        po.customer_id,
        COUNT(*) as so_count,
        SUM(CASE WHEN po.status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN po.status = 'PARTIAL' THEN 1 ELSE 0 END) as partial,
        SUM(CASE WHEN po.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(po.total_qty_plan) as total_plan,
        SUM(po.total_qty_actual) as total_actual
      FROM sales_orders po
      GROUP BY po.customer_name, po.customer_id
      ORDER BY so_count DESC
    `).all();

    const overdue = db.prepare(`
      SELECT
        so.so_number,
        po.customer_name,
        po.delivery_date,
        po.total_qty_plan,
        po.total_qty_actual,
        po.status,
        DATE('now') - DATE(po.delivery_date) as days_overdue
      FROM sales_orders po
      WHERE DATE(po.delivery_date) < DATE('now')
        AND po.status != 'COMPLETED'
      ORDER BY days_overdue DESC
      LIMIT 20
    `).all();

    res.json({ overview, byCustomer, overdue });
  } catch (error) {
    logger.error('SO status error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch SO status' } });
  }
});

// GET /api/reports/alert-history
router.get('/alert-history', authenticateToken, (req, res) => {
  try {
    const { page = 1, limit = 50, severity, type } = req.query;
    const offset = (page - 1) * limit;

    let where = '1=1';
    const params = [];
    if (severity) { where += ' AND severity = ?'; params.push(severity); }
    if (type) { where += ' AND type = ?'; params.push(type); }

    const total = db.prepare(`SELECT COUNT(*) as count FROM alerts WHERE ${where}`).get(...params).count;

    const alerts = db.prepare(`
      SELECT
        a.*,
        so.so_number
      FROM alerts a
      LEFT JOIN sales_orders po ON po.id = a.so_id
      WHERE ${where}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, Number(limit), Number(offset));

    const stats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN severity = 'critical' AND is_read = 0 THEN 1 ELSE 0 END) as critical_unread,
        SUM(CASE WHEN severity = 'warning' AND is_read = 0 THEN 1 ELSE 0 END) as warning_unread,
        SUM(CASE WHEN resolved_at IS NOT NULL THEN 1 ELSE 0 END) as resolved
      FROM alerts
    `).get();

    res.json({ alerts, stats, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    logger.error('Alert history error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch alert history' } });
  }
});

// GET /api/reports/customer-performance
router.get('/customer-performance', authenticateToken, (req, res) => {
  try {
    const performance = db.prepare(`
      SELECT
        po.customer_name as customer,
        po.customer_id,
        COUNT(DISTINCT po.id) as total_orders,
        SUM(po.total_qty_plan) as total_plan,
        SUM(po.total_qty_actual) as total_delivered,
        ROUND(CAST(SUM(po.total_qty_actual) AS FLOAT) / NULLIF(SUM(po.total_qty_plan), 0) * 100, 1) as on_time_rate,
        COUNT(DISTINCT CASE WHEN po.status = 'COMPLETED' THEN po.id END) as completed_orders,
        COUNT(DISTINCT CASE WHEN po.status = 'PARTIAL' THEN po.id END) as partial_orders,
        COUNT(DISTINCT CASE WHEN po.status = 'PENDING' THEN po.id END) as pending_orders,
        MIN(po.delivery_date) as first_delivery,
        MAX(po.delivery_date) as last_delivery
      FROM sales_orders po
      GROUP BY po.customer_name, po.customer_id
      ORDER BY total_delivered DESC
    `).all();

    const avgFulfillment = db.prepare(`
      SELECT ROUND(AVG(CAST(total_qty_actual AS FLOAT) / NULLIF(total_qty_plan, 0) * 100), 1) as avg_rate
      FROM sales_orders WHERE total_qty_plan > 0
    `).get();

    res.json({ performance, avgFulfillment: avgFulfillment?.avg_rate || 0 });
  } catch (error) {
    logger.error('Customer performance error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch customer performance' } });
  }
});

// GET /api/reports/production-metrics
router.get('/production-metrics', authenticateToken, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const metrics = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM sales_orders WHERE DATE(delivery_date) = DATE('now')) as today_deliveries,
        (SELECT COUNT(*) FROM sales_orders WHERE DATE(delivery_date) >= DATE('now', '-7 days')) as week_deliveries,
        (SELECT COUNT(*) FROM sales_orders WHERE DATE(delivery_date) >= DATE('now', '-30 days')) as month_deliveries,
        (SELECT SUM(total_qty_actual) FROM sales_orders WHERE DATE(delivery_date) = DATE('now')) as today_units,
        (SELECT SUM(total_qty_actual) FROM sales_orders WHERE DATE(delivery_date) >= DATE('now', '-7 days')) as week_units,
        (SELECT SUM(total_qty_actual) FROM sales_orders WHERE DATE(delivery_date) >= DATE('now', '-30 days')) as month_units,
        (SELECT COUNT(*) FROM sales_orders) as total_orders_all,
        (SELECT COUNT(*) FROM sales_orders WHERE status = 'COMPLETED') as completed_orders,
        (SELECT COUNT(*) FROM sales_orders WHERE status != 'COMPLETED') as pending_orders
    `).get();

    const dailyTrend = db.prepare(`
      SELECT
        DATE(delivery_date) as date,
        COUNT(*) as orders,
        SUM(total_qty_plan) as plan,
        SUM(total_qty_actual) as actual,
        ROUND(CAST(SUM(total_qty_actual) AS FLOAT) / NULLIF(SUM(total_qty_plan), 0) * 100, 1) as rate
      FROM sales_orders
      WHERE delivery_date >= DATE('now', '-30 days')
      GROUP BY DATE(delivery_date)
      ORDER BY date ASC
    `).all();

    const itemMetrics = db.prepare(`
      SELECT
        pi.item_number,
        pm.model_code,
        SUM(pi.qty_plan) as total_plan,
        SUM(pi.qty_actual) as total_actual,
        COUNT(DISTINCT pi.so_id) as so_count
      FROM so_items pi
      JOIN sales_orders po ON po.id = pi.so_id
      LEFT JOIN product_master pm ON pm.part_number = pi.item_number
      GROUP BY pi.item_number
      ORDER BY total_actual DESC
      LIMIT 20
    `).all();

    res.json({ metrics, dailyTrend, itemMetrics });
  } catch (error) {
    logger.error('Production metrics error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch production metrics' } });
  }
});

// GET /api/reports/audit-log
router.get('/audit-log', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { page = 1, limit = 100, scope, action } = req.query;
    const offset = (page - 1) * limit;

    let where = '1=1';
    const params = [];
    if (scope) { where += ' AND scope = ?'; params.push(scope); }
    if (action) { where += ' AND action = ?'; params.push(action); }

    const total = db.prepare(`SELECT COUNT(*) as count FROM so_audit_logs WHERE ${where}`).get(...params).count;

    const logs = db.prepare(`
      SELECT * FROM so_audit_logs
      WHERE ${where}
      ORDER BY at DESC
      LIMIT ? OFFSET ?
    `).all(...params, Number(limit), Number(offset));

    const stats = db.prepare(`
      SELECT
        action,
        scope,
        COUNT(*) as count
      FROM so_audit_logs
      WHERE at >= DATE('now', '-7 days')
      GROUP BY action, scope
      ORDER BY count DESC
      LIMIT 20
    `).all();

    res.json({ logs, stats, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    logger.error('Audit log error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch audit log' } });
  }
});

// POST /api/reports/export - Generate downloadable report
router.post('/export', authenticateToken, (req, res) => {
  try {
    const { reportType, format = 'json' } = req.body;

    if (!reportType) {
      return res.status(400).json({ error: { message: 'reportType is required' } });
    }

    let data = {};
    switch (reportType) {
      case 'delivery-summary': {
        const summary = db.prepare(`
          SELECT po.customer_name, COUNT(*) as orders, SUM(po.total_qty_plan) as plan, SUM(po.total_qty_actual) as actual
          FROM sales_orders po GROUP BY po.customer_name
        `).all();
        data = { reportType, generatedAt: new Date().toISOString(), data: summary };
        break;
      }
      case 'so-status': {
        const pos = db.prepare(`
          SELECT so_number, customer_name, delivery_date, status, total_qty_plan, total_qty_actual
          FROM sales_orders ORDER BY delivery_date
        `).all();
        data = { reportType, generatedAt: new Date().toISOString(), data: pos };
        break;
      }
      case 'alert-history': {
        const alerts = db.prepare(`
          SELECT a.*, so.so_number FROM alerts a LEFT JOIN sales_orders po ON po.id = a.so_id
          ORDER BY a.created_at DESC LIMIT 500
        `).all();
        data = { reportType, generatedAt: new Date().toISOString(), data: alerts };
        break;
      }
      case 'customer-performance': {
        const perf = db.prepare(`
          SELECT po.customer_name, COUNT(*) as orders, SUM(po.total_qty_plan) as plan, SUM(po.total_qty_actual) as actual,
            ROUND(CAST(SUM(po.total_qty_actual) AS FLOAT) / NULLIF(SUM(po.total_qty_plan), 0) * 100, 1) as rate
          FROM sales_orders po GROUP BY po.customer_name ORDER BY actual DESC
        `).all();
        data = { reportType, generatedAt: new Date().toISOString(), data: perf };
        break;
      }
      case 'production-metrics': {
        const metrics = db.prepare(`
          SELECT DATE(delivery_date) as date, COUNT(*) as orders, SUM(total_qty_plan) as plan, SUM(total_qty_actual) as actual
          FROM sales_orders WHERE delivery_date >= DATE('now', '-30 days') GROUP BY DATE(delivery_date) ORDER BY date
        `).all();
        data = { reportType, generatedAt: new Date().toISOString(), data: metrics };
        break;
      }
      case 'audit-log': {
        const logs = db.prepare('SELECT * FROM so_audit_logs ORDER BY at DESC LIMIT 500').all();
        data = { reportType, generatedAt: new Date().toISOString(), data: logs };
        break;
      }
      default:
        return res.status(400).json({ error: { message: 'Unknown report type' } });
    }

    logger.info('Report exported', { reportType, format, user: req.user.username });

    if (format === 'csv') {
      const headers = Object.keys(data.data[0] || {}).join(',');
      const rows = data.data.map(row => Object.values(row).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}.csv"`);
      return res.send(csv);
    }

    res.json(data);
  } catch (error) {
    logger.error('Export error:', error);
    res.status(500).json({ error: { message: 'Failed to export report' } });
  }
});

export default router;