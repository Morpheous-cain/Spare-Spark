-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'mechanic', 'parts_supplier', 'dispatcher', 'admin');
CREATE TYPE job_status AS ENUM ('DRAFT', 'PENDING', 'MATCHED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED');
CREATE TYPE job_type AS ENUM ('emergency', 'scheduled');
CREATE TYPE service_category AS ENUM ('tyre_change', 'jump_start', 'tow', 'engine_repair', 'brake_repair', 'electrical', 'ac_repair', 'body_repair', 'diagnosis', 'general', 'other');
CREATE TYPE payment_method AS ENUM ('mpesa', 'card', 'wallet');
CREATE TYPE payment_status AS ENUM ('PENDING', 'ESCROWED', 'SETTLED', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND');
CREATE TYPE payment_reference_type AS ENUM ('job', 'parts_order', 'wallet_topup');
CREATE TYPE order_status AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED');
CREATE TYPE kyc_status AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');
CREATE TYPE dispute_status AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED');
CREATE TYPE dispute_resolution AS ENUM ('full_refund', 'partial_refund', 'no_refund');
CREATE TYPE message_content_type AS ENUM ('text', 'image');
CREATE TYPE notification_type AS ENUM ('job_created', 'job_accepted', 'mechanic_en_route', 'mechanic_arrived', 'job_completed', 'payment_received', 'payout_sent', 'dispute_raised', 'dispute_resolved', 'order_dispatched', 'order_delivered', 'kyc_update');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_role ON profiles(role);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins read all" ON profiles FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'dispatcher')
);

-- Vehicles table
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reg_number TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year SMALLINT NOT NULL,
  color TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);
CREATE UNIQUE INDEX idx_vehicles_reg ON vehicles(reg_number);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner access" ON vehicles USING (auth.uid() = owner_id);

-- Mechanic profiles
CREATE TABLE mechanic_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  kyc_status kyc_status NOT NULL DEFAULT 'PENDING',
  specialisations service_category[] NOT NULL DEFAULT '{}',
  bio TEXT,
  years_experience SMALLINT,
  service_radius_km SMALLINT NOT NULL DEFAULT 10,
  is_online BOOLEAN NOT NULL DEFAULT false,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  rating_count INTEGER NOT NULL DEFAULT 0,
  total_jobs INTEGER NOT NULL DEFAULT 0,
  mpesa_number TEXT,
  bank_account JSONB,
  last_seen_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mechanic_kyc ON mechanic_profiles(kyc_status);
CREATE INDEX idx_mechanic_online ON mechanic_profiles(is_online) WHERE is_online = true;
CREATE INDEX idx_mechanic_specialisations ON mechanic_profiles USING GIN(specialisations);
CREATE INDEX idx_mechanic_rating ON mechanic_profiles(rating_avg DESC);

ALTER TABLE mechanic_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mechanic reads own" ON mechanic_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Mechanic updates own" ON mechanic_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Customers read approved mechanics" ON mechanic_profiles FOR SELECT USING (kyc_status = 'APPROVED');
CREATE POLICY "Admins full access" ON mechanic_profiles USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'dispatcher')
);

-- Mechanic documents
CREATE TABLE mechanic_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_id UUID NOT NULL REFERENCES mechanic_profiles(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status kyc_status NOT NULL DEFAULT 'PENDING',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mechanic_docs_mechanic ON mechanic_documents(mechanic_id);

ALTER TABLE mechanic_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mechanic reads own docs" ON mechanic_documents FOR SELECT USING (auth.uid() = mechanic_id);
CREATE POLICY "Admins full access" ON mechanic_documents USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'dispatcher')
);

-- Mechanic locations (high-write, ephemeral)
CREATE TABLE mechanic_locations (
  mechanic_id UUID PRIMARY KEY REFERENCES mechanic_profiles(id) ON DELETE CASCADE,
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  heading SMALLINT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mechanic_locations ADD COLUMN geom GEOGRAPHY(POINT, 4326)
  GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED;
CREATE INDEX idx_mechanic_locations_geom ON mechanic_locations USING GIST(geom);

ALTER TABLE mechanic_locations REPLICA IDENTITY FULL;
ALTER TABLE mechanic_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mechanics update own location" ON mechanic_locations FOR ALL USING (auth.uid() = mechanic_id);
-- Policy "Customers read location for active job" created AFTER jobs table exists

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  mechanic_id UUID REFERENCES mechanic_profiles(id),
  type job_type NOT NULL DEFAULT 'emergency',
  service_category service_category NOT NULL,
  status job_status NOT NULL DEFAULT 'PENDING',
  description TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  evidence_urls TEXT[] DEFAULT '{}',
  location_lat NUMERIC(10,7) NOT NULL,
  location_lng NUMERIC(10,7) NOT NULL,
  location_address TEXT NOT NULL,
  price_estimate_min INTEGER,
  price_estimate_max INTEGER,
  agreed_price INTEGER,
  currency TEXT NOT NULL DEFAULT 'KES',
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  scheduled_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_customer ON jobs(customer_id);
CREATE INDEX idx_jobs_mechanic ON jobs(mechanic_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);
CREATE INDEX idx_jobs_location ON jobs USING GIST(ST_SetSRID(ST_MakePoint(location_lng, location_lat), 4326));

ALTER TABLE jobs REPLICA IDENTITY FULL;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customer reads own jobs" ON jobs FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Mechanic reads assigned jobs" ON jobs FOR SELECT USING (auth.uid() = mechanic_id);
CREATE POLICY "Customer creates jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Mechanics see PENDING jobs" ON jobs FOR SELECT USING (status = 'PENDING');
CREATE POLICY "Admins full access" ON jobs USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'dispatcher')
);

-- Add mechanic_locations policy that references jobs (now exists)
CREATE POLICY "Customers read location for active job" ON mechanic_locations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.mechanic_id = mechanic_locations.mechanic_id
      AND jobs.customer_id = auth.uid()
      AND jobs.status IN ('ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS')
  )
);

-- Job bids
CREATE TABLE job_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  mechanic_id UUID NOT NULL REFERENCES mechanic_profiles(id),
  price INTEGER NOT NULL,
  eta_minutes SMALLINT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_bids_job ON job_bids(job_id);
CREATE INDEX idx_job_bids_mechanic ON job_bids(mechanic_id);
CREATE UNIQUE INDEX idx_job_bids_unique ON job_bids(job_id, mechanic_id);

ALTER TABLE job_bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mechanic manages own bids" ON job_bids FOR ALL USING (auth.uid() = mechanic_id);
CREATE POLICY "Customer reads bids on own jobs" ON job_bids FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND customer_id = auth.uid())
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_type payment_reference_type NOT NULL,
  reference_id UUID NOT NULL,
  payer_id UUID NOT NULL REFERENCES profiles(id),
  payee_id UUID REFERENCES profiles(id),
  method payment_method NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  platform_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  status payment_status NOT NULL DEFAULT 'PENDING',
  mpesa_checkout_id TEXT,
  mpesa_ref TEXT,
  flutterwave_ref TEXT,
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_transactions_payer ON transactions(payer_id);
CREATE INDEX idx_transactions_reference ON transactions(reference_type, reference_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_mpesa_ref ON transactions(mpesa_ref) WHERE mpesa_ref IS NOT NULL;

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own transactions" ON transactions FOR SELECT USING (
  auth.uid() = payer_id OR auth.uid() = payee_id
);
CREATE POLICY "Admins full access" ON transactions USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'dispatcher')
);

-- Parts
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  sku TEXT,
  price NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  stock_qty INTEGER NOT NULL DEFAULT 0,
  image_urls TEXT[] DEFAULT '{}',
  compatible_with JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_parts_supplier ON parts(supplier_id);
CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_parts_active ON parts(is_active) WHERE is_active = true;
CREATE INDEX idx_parts_search ON parts USING GIN(to_tsvector('english', name || ' ' || coalesce(brand, '') || ' ' || coalesce(description, '')));

ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads active parts" ON parts FOR SELECT USING (is_active = true);
CREATE POLICY "Supplier manages own parts" ON parts FOR ALL USING (auth.uid() = supplier_id);

-- Parts orders
CREATE TABLE parts_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  job_id UUID REFERENCES jobs(id),
  status order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  delivery_lat NUMERIC(10,7),
  delivery_lng NUMERIC(10,7),
  delivery_address TEXT NOT NULL,
  delivery_slot TEXT NOT NULL DEFAULT 'next_day',
  scheduled_at TIMESTAMPTZ,
  subtotal NUMERIC(12,2) NOT NULL,
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_parts_orders_customer ON parts_orders(customer_id);
CREATE INDEX idx_parts_orders_status ON parts_orders(status);

ALTER TABLE parts_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customer reads own orders" ON parts_orders FOR SELECT USING (auth.uid() = customer_id);

-- Parts order items
CREATE TABLE parts_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES parts_orders(id) ON DELETE CASCADE,
  part_id UUID NOT NULL REFERENCES parts(id),
  supplier_id UUID NOT NULL REFERENCES profiles(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_order_items_order ON parts_order_items(order_id);
CREATE INDEX idx_order_items_supplier ON parts_order_items(supplier_id);

ALTER TABLE parts_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order item read through order" ON parts_order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM parts_orders WHERE id = order_id AND customer_id = auth.uid())
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT,
  content_type message_content_type NOT NULL DEFAULT 'text',
  image_url TEXT,
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_job ON messages(job_id, sent_at);
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Job parties read messages" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND (customer_id = auth.uid() OR mechanic_id = auth.uid()))
);
CREATE POLICY "Job parties send messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND (customer_id = auth.uid() OR mechanic_id = auth.uid()))
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  reviewee_id UUID NOT NULL REFERENCES profiles(id),
  rated_role TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_reviews_unique ON reviews(job_id, reviewer_id, rated_role);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Job parties create reviews" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND status = 'COMPLETED' AND (customer_id = auth.uid() OR mechanic_id = auth.uid()))
);
CREATE POLICY "Public read mechanic reviews" ON reviews FOR SELECT USING (rated_role = 'mechanic');

-- Disputes
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  raised_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status dispute_status NOT NULL DEFAULT 'OPEN',
  resolution dispute_resolution,
  refund_amount NUMERIC(12,2),
  notes TEXT,
  assigned_to UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_disputes_job ON disputes(job_id);
CREATE INDEX idx_disputes_status ON disputes(status);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties read own disputes" ON disputes FOR SELECT USING (
  auth.uid() = raised_by OR EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND mechanic_id = auth.uid())
);
CREATE POLICY "Admins full access" ON disputes USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'dispatcher')
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  sent_push BOOLEAN NOT NULL DEFAULT false,
  sent_sms BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User reads own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User marks own as read" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_mechanic_profiles_updated BEFORE UPDATE ON mechanic_profiles FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_parts_updated BEFORE UPDATE ON parts FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_parts_orders_updated BEFORE UPDATE ON parts_orders FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_disputes_updated BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Trigger to update mechanic rating on new review
CREATE OR REPLACE FUNCTION update_mechanic_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mechanic_profiles
  SET
    rating_avg = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE reviewee_id = NEW.reviewee_id AND rated_role = 'mechanic'),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id AND rated_role = 'mechanic')
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_mechanic_rating AFTER INSERT ON reviews
FOR EACH ROW WHEN (NEW.rated_role = 'mechanic')
EXECUTE FUNCTION update_mechanic_rating();