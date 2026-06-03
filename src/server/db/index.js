// db/index.js - Database connection and initialization
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import logger from '../utils/logger.js';
import { runMigrations } from './migrations.js';
import { initializeSchema } from './schema.js';
import { seedData } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// PRODUCTION DATABASE - Use production.db as it's not locked
const DB_PATH = process.env.DB_PATH || 'C:/so_management/data/production.db';

// Ensure directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

logger.info(`Database path: ${DB_PATH}`);

const db = new Database(DB_PATH, { timeout: 30000 });
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 30000');
db.pragma('synchronous = NORMAL');
db.pragma('read_uncommitted = true');

runMigrations(db);
initializeSchema(db);
// seedData(db); // Temporarily disabled for debugging

logger.info('Database initialized');

export default db;