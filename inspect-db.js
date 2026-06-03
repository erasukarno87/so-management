import Database from 'better-sqlite3';

const db = new Database('data/delivery.db');

console.log('\n========== DATABASE STRUCTURE ==========\n');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

tables.forEach(t => {
  console.log(`\n📊 TABLE: ${t.name}`);
  
  // Get columns
  const schema = db.prepare(`PRAGMA table_info(${t.name})`).all();
  console.log('   Columns:');
  schema.forEach(col => {
    console.log(`     • ${col.name} (${col.type}${col.notnull ? ', NOT NULL' : ''}${col.pk ? ', PRIMARY KEY' : ''})`);
  });
  
  // Get row count
  const rowCount = db.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get();
  console.log(`   Row Count: ${rowCount.count}`);
  
  // Show sample data
  if (rowCount.count > 0) {
    const limit = Math.min(3, rowCount.count);
    const rows = db.prepare(`SELECT * FROM ${t.name} LIMIT ${limit}`).all();
    console.log(`   Sample Data (first ${limit} rows):`);
    rows.forEach((row, idx) => {
      console.log(`     [${idx + 1}] ${JSON.stringify(row)}`);
    });
  }
});

console.log('\n========================================\n');
db.close();
