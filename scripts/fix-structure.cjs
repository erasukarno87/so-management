const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

console.log('=== FIXING DATA STRUCTURE ===');

const dbPath = 'C:/so_management/data/delivery.db';
const db = new Database(dbPath, { timeout: 5000 });

try {
  console.log('Database opened successfully');

  // Step 1: Clean customers
  console.log('\nStep 1: Cleaning customers...');

  // First, update all sales orders to use CUST-001
  db.prepare("UPDATE sales_orders SET customer_id = 'CUST-001' WHERE customer_id LIKE 'CUST-%' OR customer_id LIKE 'IYM%'").run();
  console.log('Updated sales_orders customer_id');

  // Delete duplicate IYM customers
  db.prepare("DELETE FROM customers WHERE id != 'CUST-001' AND id != 'CUST-002'").run();
  console.log('Deleted duplicate customers');

  const cust = db.prepare('SELECT id, name FROM customers ORDER BY name').all();
  console.log('Current customers:');
  cust.forEach(c => console.log('  -', c.id, '|', c.name));

  // Step 2: Clear and create proper destinations
  console.log('\nStep 2: Creating destinations...');

  db.prepare('DELETE FROM customer_destinations').run();
  console.log('Cleared existing destinations');

  const destinations = [
    { customer_id: 'CUST-001', code: 'IYM-CMD', name: 'Chennai', types: ['Regular', 'CKD', 'Non Regular'] },
    { customer_id: 'CUST-001', code: 'IYM-SJP', name: 'Surajpur', types: ['Regular', 'CKD', 'Non Regular'] },
    { customer_id: 'CUST-002', code: 'CLT-CMD', name: 'Chennai', types: ['Regular', 'CKD', 'Non Regular'] },
    { customer_id: 'CUST-002', code: 'CLT-SJP', name: 'Surajpur', types: ['Regular', 'CKD', 'Non Regular'] },
  ];

  const insertDest = db.prepare('INSERT INTO customer_destinations (id, customer_id, code, name, is_default, delivery_types, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))');

  for (const dest of destinations) {
    insertDest.run(uuidv4(), dest.customer_id, dest.code, dest.name, 0, JSON.stringify(dest.types));
    console.log('  Created:', dest.code, '-', dest.name);
  }

  // Step 3: Update sales_orders destination_id to use code
  console.log('\nStep 3: Update sales_orders destination_id...');
  db.prepare("UPDATE sales_orders SET destination_id = 'IYM-CMD' WHERE UPPER(delivery_destination) LIKE '%CHENNAI%'").run();
  db.prepare("UPDATE sales_orders SET destination_id = 'IYM-SJP' WHERE UPPER(delivery_destination) LIKE '%SURAJPUR%'").run();
  console.log('Updated destination_id in sales_orders');

  console.log('\n=== VERIFICATION ===');
  const dests = db.prepare('SELECT customer_id, code, name, delivery_types FROM customer_destinations').all();
  console.log('Destinations:');
  dests.forEach(d => console.log('  -', d.code, '|', d.name, '| customer:', d.customer_id));

  console.log('\nSales Orders sample:');
  const so = db.prepare('SELECT id, customer_id, destination_id, delivery_destination FROM sales_orders LIMIT 3').all();
  so.forEach(s => console.log('  id:', s.id, '| customer:', s.customer_id, '| dest_id:', s.destination_id, '| address:', s.delivery_destination));

} catch (err) {
  console.error('Error:', err.message);
} finally {
  db.close();
  console.log('\nDone!');
}