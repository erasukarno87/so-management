// migrations.js - Database migrations
import logger from '../utils/logger.js';

export function runMigrations(db) {
  logger.info('Running database migrations...');

  // Migration: Add remark column
  safeExec(db, "ALTER TABLE sales_orders ADD COLUMN remark TEXT DEFAULT ''", 'remark column to sales_orders');

  // Migration: Validate and fix delivery_type values
  migrateDeliveryTypes(db);

  // Migration: Add last_login column
  safeExec(db, "ALTER TABLE users ADD COLUMN last_login TEXT", 'last_login column to users');

  // Migration: Add password_plain column
  safeExec(db, "ALTER TABLE users ADD COLUMN password_plain TEXT", 'password_plain column to users');

  // Migration: Populate password_plain for existing users
  migratePasswords(db);

  // Migration: Add destination columns
  safeExec(db, "ALTER TABLE sales_orders ADD COLUMN destination_id TEXT", 'destination_id to sales_orders');
  safeExec(db, "ALTER TABLE sales_orders ADD COLUMN destination_name TEXT", 'destination_name to sales_orders');

  // Migration: Add delivery_types to customer_destinations
  safeExec(db, "ALTER TABLE customer_destinations ADD COLUMN delivery_types TEXT DEFAULT '[\"Regular\",\"CKD\",\"Non Regular\"]'", 'delivery_types to customer_destinations');

  // Migration: Add created_by to delivery_batches
  safeExec(db, "ALTER TABLE delivery_batches ADD COLUMN created_by TEXT", 'created_by to delivery_batches');

  // Migration: Add created_at to product_master (may not exist in older tables)
  safeExec(db, "ALTER TABLE product_master ADD COLUMN created_at TEXT", 'created_at to product_master');

  logger.info('Migrations complete');
}

function safeExec(db, sql, description) {
  try {
    db.exec(sql);
    logger.info(`Migration: ${description} added`);
  } catch (e) {
    // Column may already exist, ignore
  }
}

function migrateDeliveryTypes(db) {
  try {
    const validTypes = ['Regular', 'CKD', 'Non Regular'];
    const stmt = db.prepare("SELECT id, delivery_type, remark FROM sales_orders WHERE delivery_type NOT IN (?, ?, ?)");
    const rows = stmt.all('Regular', 'CKD', 'Non Regular');

    if (rows.length > 0) {
      const updateStmt = db.prepare("UPDATE sales_orders SET remark = ?, delivery_type = 'Non Regular' WHERE id = ?");
      for (const row of rows) {
        const newRemark = row.remark ? `${row.remark}; ${row.delivery_type}` : row.delivery_type;
        updateStmt.run(newRemark, row.id);
      }
      logger.info(`Migration: fixed ${rows.length} invalid delivery_type values`);
    }
  } catch (e) {
    logger.warn('Migration: delivery_type validation skipped', e.message);
  }
}

function migratePasswords(db) {
  try {
    const usersWithoutPlain = db.prepare("SELECT id, username FROM users WHERE password_plain IS NULL").all();
    if (usersWithoutPlain.length > 0) {
      logger.info(`Migrating ${usersWithoutPlain.length} existing users to add password_plain...`);
      const updateStmt = db.prepare("UPDATE users SET password_plain = ? WHERE id = ?");
      for (const user of usersWithoutPlain) {
        updateStmt.run(user.username + '123', user.id);
      }
      logger.info('Migration complete: existing users password_plain populated');
    }
  } catch (e) {
    logger.warn('Migration for password_plain skipped:', e.message);
  }
}

export default runMigrations;