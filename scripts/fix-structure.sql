-- ============================================================
-- FULL RESET DATA STRUCTURE - SO Management
-- Run each statement one by one in SQLite Viewer
-- ============================================================

-- STEP 1: Delete all customers first
DELETE FROM customers;

-- STEP 2: Insert only 2 main customers
INSERT INTO customers (id, name, delivery_type_id, created_at, updated_at)
VALUES ('CUST-001', 'IYM', 'dt-2', datetime('now'), datetime('now'));

INSERT INTO customers (id, name, delivery_type_id, created_at, updated_at)
VALUES ('CUST-002', 'CHAO LONG TAIWAN', 'dt-1', datetime('now'), datetime('now'));

-- STEP 3: Delete all customer_destinations
DELETE FROM customer_destinations;

-- STEP 4: Insert new destinations for IYM
INSERT INTO customer_destinations (id, customer_id, code, name, is_default, delivery_types, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'CUST-001', 'IYM-CHN', 'Chennai', 1, '["Regular","CKD","Non Regular"]', datetime('now'), datetime('now'));

INSERT INTO customer_destinations (id, customer_id, code, name, is_default, delivery_types, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'CUST-001', 'IYM-SJP', 'Surajpur', 0, '["Regular","CKD","Non Regular"]', datetime('now'), datetime('now'));

-- STEP 5: Insert destination for CHAO LONG TAIWAN
INSERT INTO customer_destinations (id, customer_id, code, name, is_default, delivery_types, created_at, updated_at)
VALUES (lower(hex(randomblob(16))), 'CUST-002', 'CLT-HQ', 'Headquarters', 1, '["Regular","CKD","Non Regular"]', datetime('now'), datetime('now'));

-- STEP 6: Update sales_orders customer_id to CUST-001
UPDATE sales_orders SET customer_id = 'CUST-001'
WHERE customer_id LIKE 'CUST-%' OR customer_id LIKE 'IYM%';

-- STEP 7: Update sales_orders destination_id
UPDATE sales_orders SET destination_id = 'IYM-CHN'
WHERE UPPER(delivery_destination) LIKE '%CHENNAI%';

UPDATE sales_orders SET destination_id = 'IYM-SJP'
WHERE UPPER(delivery_destination) LIKE '%SURAJPUR%';

-- ============================================================
-- VERIFICATION (copy and run these separately)
-- ============================================================

-- SELECT 'Customers:' as info; SELECT * FROM customers;
-- SELECT 'Destinations:' as info; SELECT customer_id, code, name, delivery_types FROM customer_destinations;
-- SELECT 'Sales Orders Sample:' as info; SELECT customer_id, destination_id, delivery_destination FROM sales_orders LIMIT 5;