-- Seed development data
-- Run after initial schema migration

-- Insert test profiles (these would be created via auth in real app)
-- We'll use auth.uid() references, so in dev you'd create users via Supabase Auth UI
-- then run this to create their profiles

-- Example: Create a test customer profile
-- INSERT INTO profiles (id, role, full_name, phone, email, is_verified)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'customer',
--   'John Kamau',
--   '+254712345678',
--   'john@example.com',
--   true
-- );

-- Example: Create a test mechanic profile
-- INSERT INTO profiles (id, role, full_name, phone, email, is_verified)
-- VALUES (
--   '00000000-0000-0000-0000-000000000002',
--   'mechanic',
--   'Peter Mwangi',
--   '+254700000001',
--   'peter@example.com',
--   true
-- );

-- INSERT INTO mechanic_profiles (id, kyc_status, specialisations, service_radius_km, is_online, mpesa_number)
-- VALUES (
--   '00000000-0000-0000-0000-000000000002',
--   'APPROVED',
--   ARRAY['tyre_change', 'jump_start', 'engine_repair'],
--   15,
--   true,
--   '+254700000001'
-- );

-- Example parts supplier
-- INSERT INTO profiles (id, role, full_name, phone, email, is_verified)
-- VALUES (
--   '00000000-0000-0000-0000-000000000003',
--   'parts_supplier',
--   'AutoZone Nairobi',
--   '+254700000002',
--   'info@autozone.co.ke',
--   true
-- );

-- Sample parts
-- INSERT INTO parts (supplier_id, name, description, category, brand, price, stock_qty, is_active)
-- VALUES
--   ('00000000-0000-0000-0000-000000000003', 'Front Brake Pads - Toyota Premio 2019', 'Premium Bosch brake pads', 'brakes', 'Bosch', 2500, 8, true),
--   ('00000000-0000-0000-0000-000000000003', 'Car Battery 12V 60Ah', 'Maintenance-free with 2-year warranty', 'electrical', 'Exide', 8500, 5, true),
--   ('00000000-0000-0000-0000-000000000003', 'Air Filter - High Flow', 'Performance air filter improves fuel efficiency', 'filters', 'K&N', 1200, 12, true);

-- Admin user
-- INSERT INTO profiles (id, role, full_name, phone, email, is_verified)
-- VALUES (
--   '00000000-0000-0000-0000-000000000004',
--   'admin',
--   'Sparespark Admin',
--   '+254700000000',
--   'admin@sparespark.co.ke',
--   true
-- );