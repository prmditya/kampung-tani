-- Minimal seed for ingestion testing

-- 1) Add farmer
INSERT INTO farmers (name, contact, address)
VALUES ('Mr.A', '08123456789', 'Field A')
ON CONFLICT DO NOTHING;

-- 2) Add farm for the farmer
INSERT INTO farms (farmer_id, name, location, latitude, longitude, area_size, soil_type)
VALUES (
  (SELECT id FROM farmers WHERE name='Mr.A' LIMIT 1),
  'Farm A',
  'Village X',
  -6.2, 106.8,
  1.2,
  'loam'
)
ON CONFLICT DO NOTHING;

-- 3) Ensure admin user exists (sample password hash from schema)
INSERT INTO users (username, email, password_hash, role)
SELECT 'admin', 'admin@kampungtani.com', '$2b$12$M99Sm1H.pamxjBZ36d0efuGeZ5EbjqNFSDlf34meSgG9HwD0i1rcO', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='admin');

-- 4) Add gateway (owner = admin user id)
INSERT INTO gateways (user_id, gateway_uid, name, mac_address, description, status, last_seen)
VALUES (
  (SELECT id FROM users WHERE username='admin' LIMIT 1),
  'GTW-F4FBF3',
  'Gateway GTW-F4FBF3',
  '00:11:22:33:44:55',
  'Test gateway',
  'online',
  NOW()
)
ON CONFLICT (gateway_uid) DO NOTHING;

-- 5) Add sensor for the gateway
INSERT INTO sensors (gateway_id, sensor_uid, name, type, status)
VALUES (
  (SELECT id FROM gateways WHERE gateway_uid='GTW-F4FBF3' LIMIT 1),
  'SEM225-01',
  'SEM225-01',
  'soil_sensor',
  'active'
)
ON CONFLICT (sensor_uid) DO NOTHING;

-- 6) Create active assignment linking gateway -> farm
INSERT INTO gateway_assignments (gateway_id, farm_id, assigned_by, start_date, is_active)
VALUES (
  (SELECT id FROM gateways WHERE gateway_uid='GTW-F4FBF3' LIMIT 1),
  (SELECT id FROM farms WHERE name='Farm A' LIMIT 1),
  (SELECT id FROM users WHERE username='admin' LIMIT 1),
  NOW(),
  true
)
ON CONFLICT DO NOTHING;
