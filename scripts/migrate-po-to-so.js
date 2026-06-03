// Migration script to rename PO tables/columns to SO
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '..', 'data', 'delivery.db');

if (!fs.existsSync(DB_PATH)) {
  console.log('Database not found. Will create new schema.');
  process.exit(0);
}

const db = new Database(DB_PATH);
db.pragma('foreign_keys = OFF');

console.log('Starting migration: PO to SO rename...');

// Check which tables exist
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
console.log('Existing tables:', tables);

// Migration 1: Rename po_items to so_items
if (tables.includes('po_items') && !tables.includes('so_items')) {
  console.log('Renaming po_items to so_items...');
  db.exec('ALTER TABLE po_items RENAME TO so_items');
  console.log('  ✓ Renamed po_items to so_items');
}

// Migration 2: Rename po_locks to so_locks
if (tables.includes('po_locks') && !tables.includes('so_locks')) {
  console.log('Renaming po_locks to so_locks...');
  db.exec('ALTER TABLE po_locks RENAME TO so_locks');
  console.log('  ✓ Renamed po_locks to so_locks');
}

// Migration 3: Rename po_audit_logs to so_audit_logs
if (tables.includes('po_audit_logs') && !tables.includes('so_audit_logs')) {
  console.log('Renaming po_audit_logs to so_audit_logs...');
  db.exec('ALTER TABLE po_audit_logs RENAME TO so_audit_logs');
  console.log('  ✓ Renamed po_audit_logs to so_audit_logs');
}

// Migration 4: Rename po_number column in sales_orders to so_number
try {
  const columns = db.prepare("PRAGMA table_info(sales_orders)").all().map(c => c.name);
  if (columns.includes('po_number') && !columns.includes('so_number')) {
    console.log('Renaming po_number to so_number in sales_orders...');
    db.exec('ALTER TABLE sales_orders RENAME COLUMN po_number TO so_number');
    console.log('  ✓ Renamed po_number to so_number');
  }
} catch (e) {
  console.log('Column rename skipped (may already exist or SQLite version issue):', e.message);
}

// Migration 5: Rename po_id column in so_items to so_id
try {
  const columns = db.prepare("PRAGMA table_info(so_items)").all().map(c => c.name);
  if (columns.includes('po_id') && !columns.includes('so_id')) {
    console.log('Renaming po_id to so_id in so_items...');
    db.exec('ALTER TABLE so_items RENAME COLUMN po_id TO so_id');
    console.log('  ✓ Renamed po_id to so_id');
  }
} catch (e) {
  console.log('Column rename skipped:', e.message);
}

// Migration 6: Rename po_item_id column in delivery_batches to so_item_id
try {
  const columns = db.prepare("PRAGMA table_info(delivery_batches)").all().map(c => c.name);
  if (columns.includes('po_item_id') && !columns.includes('so_item_id')) {
    console.log('Renaming po_item_id to so_item_id in delivery_batches...');
    db.exec('ALTER TABLE delivery_batches RENAME COLUMN po_item_id TO so_item_id');
    console.log('  ✓ Renamed po_item_id to so_item_id');
  }
} catch (e) {
  console.log('Column rename skipped:', e.message);
}

// Migration 7: Rename po_id column in alerts to so_id
try {
  const columns = db.prepare("PRAGMA table_info(alerts)").all().map(c => c.name);
  if (columns.includes('po_id') && !columns.includes('so_id')) {
    console.log('Renaming po_id to so_id in alerts...');
    db.exec('ALTER TABLE alerts RENAME COLUMN po_id TO so_id');
    console.log('  ✓ Renamed po_id to so_id');
  }
} catch (e) {
  console.log('Column rename skipped:', e.message);
}

// Migration 8: Rename po_id column in so_locks to so_id
try {
  const columns = db.prepare("PRAGMA table_info(so_locks)").all().map(c => c.name);
  if (columns.includes('po_id') && !columns.includes('so_id')) {
    console.log('Renaming po_id to so_id in so_locks...');
    db.exec('ALTER TABLE so_locks RENAME COLUMN po_id TO so_id');
    console.log('  ✓ Renamed po_id to so_id');
  }
} catch (e) {
  console.log('Column rename skipped:', e.message);
}

// Migration 9: Rename po_number column in delivery_amend_requests to so_number
try {
  const columns = db.prepare("PRAGMA table_info(delivery_amend_requests)").all().map(c => c.name);
  if (columns.includes('po_number') && !columns.includes('so_number')) {
    console.log('Renaming po_number to so_number in delivery_amend_requests...');
    db.exec('ALTER TABLE delivery_amend_requests RENAME COLUMN po_number TO so_number');
    console.log('  ✓ Renamed po_number to so_number');
  }
} catch (e) {
  console.log('Column rename skipped:', e.message);
}

// Update foreign key references in so_items
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS so_items_new (
      id TEXT PRIMARY KEY,
      so_id TEXT NOT NULL,
      item_number TEXT NOT NULL,
      model_code TEXT NOT NULL,
      qty_plan INTEGER NOT NULL DEFAULT 0,
      qty_actual INTEGER NOT NULL DEFAULT 0,
      delivery_schedule TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (so_id) REFERENCES sales_orders(id) ON DELETE CASCADE
    );
  `);
  db.exec(`
    INSERT INTO so_items_new SELECT * FROM so_items;
  `);
  db.exec('DROP TABLE so_items');
  db.exec('ALTER TABLE so_items_new RENAME TO so_items');
  console.log('  ✓ Recreated so_items with correct foreign key');
} catch (e) {
  console.log('  so_items FK recreation skipped:', e.message);
}

// Update foreign key references in so_locks
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS so_locks_new (
      so_id TEXT PRIMARY KEY,
      claimed_by TEXT NOT NULL,
      claimed_by_name TEXT NOT NULL,
      claimed_at TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (so_id) REFERENCES sales_orders(id) ON DELETE CASCADE
    );
  `);
  db.exec(`
    INSERT INTO so_locks_new SELECT * FROM so_locks;
  `);
  db.exec('DROP TABLE so_locks');
  db.exec('ALTER TABLE so_locks_new RENAME TO so_locks');
  console.log('  ✓ Recreated so_locks with correct foreign key');
} catch (e) {
  console.log('  so_locks FK recreation skipped:', e.message);
}

// Update foreign key references in delivery_batches
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS delivery_batches_new (
      id TEXT PRIMARY KEY,
      so_item_id TEXT NOT NULL,
      item_card_barcode TEXT NOT NULL,
      qty_total INTEGER NOT NULL DEFAULT 0,
      qty_scanned INTEGER NOT NULL DEFAULT 0,
      boxes_required INTEGER NOT NULL DEFAULT 0,
      boxes_completed INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK(status IN ('IN_PROGRESS','COMPLETED')),
      started_at TEXT NOT NULL,
      completed_at TEXT,
      created_by TEXT NOT NULL,
      FOREIGN KEY (so_item_id) REFERENCES so_items(id) ON DELETE CASCADE
    );
  `);
  db.exec(`
    INSERT INTO delivery_batches_new SELECT * FROM delivery_batches;
  `);
  db.exec('DROP TABLE delivery_batches');
  db.exec('ALTER TABLE delivery_batches_new RENAME TO delivery_batches');
  console.log('  ✓ Recreated delivery_batches with correct foreign key');
} catch (e) {
  console.log('  delivery_batches FK recreation skipped:', e.message);
}

// Update foreign key references in alerts
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts_new (
      id TEXT PRIMARY KEY,
      so_id TEXT,
      type TEXT NOT NULL CHECK(type IN ('DELAY','QTY_MISMATCH','DUPLICATE','PREFIX_MISMATCH')),
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'warning' CHECK(severity IN ('critical','warning','info')),
      sla_minutes INTEGER NOT NULL DEFAULT 120,
      escalated INTEGER NOT NULL DEFAULT 0,
      escalated_at TEXT,
      resolved_at TEXT,
      FOREIGN KEY (so_id) REFERENCES sales_orders(id) ON DELETE SET NULL
    );
  `);
  db.exec(`
    INSERT INTO alerts_new SELECT * FROM alerts;
  `);
  db.exec('DROP TABLE alerts');
  db.exec('ALTER TABLE alerts_new RENAME TO alerts');
  console.log('  ✓ Recreated alerts with correct foreign key');
} catch (e) {
  console.log('  alerts FK recreation skipped:', e.message);
}

// Recreate indexes
try {
  db.exec('DROP INDEX IF EXISTS idx_po_locks_expires_at');
  db.exec('DROP INDEX IF EXISTS idx_po_audit_logs_at');

  db.exec('CREATE INDEX IF NOT EXISTS idx_so_locks_expires_at ON so_locks(expires_at)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_so_audit_logs_at ON so_audit_logs(at DESC)');
  console.log('  ✓ Recreated indexes with new names');
} catch (e) {
  console.log('  Index recreation skipped:', e.message);
}

db.pragma('foreign_keys = ON');

// Verify final state
const finalTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
console.log('\nFinal tables:', finalTables);

// Check columns in sales_orders
const soColumns = db.prepare("PRAGMA table_info(sales_orders)").all().map(c => c.name);
console.log('sales_orders columns:', soColumns);

db.close();
console.log('\n✓ Migration completed successfully!');
console.log('Note: You may need to restart the server for changes to take effect.');