// seed.js - Seed essential default data only (NO sample data)
// Real data should come from production database or user input

import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

export function seedData(db) {
  seedDeliveryTypes(db);
  seedRolePermissions(db);
  seedAdminUser(db);
  // Removed: seedSampleSalesOrders() - use real data from database
}

function seedDeliveryTypes(db) {
  try {
    const typeCount = db.prepare('SELECT COUNT(*) as count FROM delivery_types').get();
    if (typeCount.count === 0) {
      const insertStmt = db.prepare('INSERT INTO delivery_types (id, name, sort_order) VALUES (?, ?, ?)');
      insertStmt.run('dt-1', 'Non Regular', 1);
      insertStmt.run('dt-2', 'Regular', 2);
      insertStmt.run('dt-3', 'CKD', 3);
      logger.info('Delivery types seeded');
    }
  } catch (e) {
    logger.warn('Delivery types seeding skipped:', e.message);
  }
}

function seedRolePermissions(db) {
  try {
    const rolePermissionCount = db.prepare('SELECT COUNT(*) as count FROM role_permission_matrix').get();
    if (rolePermissionCount.count === 0) {
      const defaults = [
        { module: 'Dashboard', sort_order: 1, admin: 1, ppic: 1, warehouse: 1, qc: 1, viewer: 1 },
        { module: 'Sales Orders', sort_order: 2, admin: 1, ppic: 1, warehouse: 1, qc: 1, viewer: 1 },
        { module: 'Delivery Execution', sort_order: 3, admin: 1, ppic: 1, warehouse: 1, qc: 0, viewer: 0 },
        { module: 'Reports & Analytics', sort_order: 4, admin: 1, ppic: 1, warehouse: 1, qc: 1, viewer: 1 },
        { module: 'Offline Queue Monitoring', sort_order: 5, admin: 1, ppic: 1, warehouse: 1, qc: 0, viewer: 0 },
        { module: 'Webhook Admin', sort_order: 6, admin: 1, ppic: 0, warehouse: 0, qc: 0, viewer: 0 },
        { module: 'Master Data', sort_order: 7, admin: 1, ppic: 0, warehouse: 0, qc: 0, viewer: 0 },
        { module: 'Manage Users', sort_order: 8, admin: 1, ppic: 0, warehouse: 0, qc: 0, viewer: 0 },
        { module: 'Manage Product Master', sort_order: 9, admin: 1, ppic: 0, warehouse: 0, qc: 0, viewer: 0 },
        { module: 'Manage Customers', sort_order: 10, admin: 1, ppic: 0, warehouse: 0, qc: 0, viewer: 0 },
      ];

      const insertStmt = db.prepare(
        'INSERT INTO role_permission_matrix (module, sort_order, admin, ppic, warehouse, qc, viewer) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );

      for (const item of defaults) {
        insertStmt.run(item.module, item.sort_order, item.admin, item.ppic, item.warehouse, item.qc, item.viewer);
      }
      logger.info('Role permissions seeded');
    }
  } catch (e) {
    logger.warn('Role permissions seeding skipped:', e.message);
  }
}

function seedAdminUser(db) {
  try {
    const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
    if (!adminExists) {
      const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin@123456!';
      const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

      db.prepare(
        "INSERT INTO users (id, username, name, role, password, password_plain, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))"
      ).run('admin-001', 'admin', 'System Administrator', 'admin', hashedPassword, defaultPassword);

      logger.info('Default admin user created');
      logger.info('Username: admin');
      logger.info(`Password: ${defaultPassword}`);
    }
  } catch (e) {
    logger.warn('Admin user seeding skipped:', e.message);
  }
}

export default seedData;