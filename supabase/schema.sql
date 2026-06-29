-- ============================================================
-- BookFlow — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('owner', 'customer', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── BUSINESSES ──────────────────────────────────────────────
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  location TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  cover_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  working_hours JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SERVICES ────────────────────────────────────────────────
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 30, -- minutes
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── APPOINTMENTS ────────────────────────────────────────────
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for availability checks
CREATE INDEX appointments_slot_idx ON appointments(business_id, date, start_time, end_time, status);

-- ─── REVIEWS ─────────────────────────────────────────────────
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(appointment_id) -- one review per appointment
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ─── Profiles ────────────────────────────────────────────────
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow business owners to read customer profiles for their appointments
CREATE POLICY "Business owners can view customers"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN businesses b ON b.id = a.business_id
      WHERE a.customer_id = profiles.id
        AND b.owner_id = auth.uid()
    )
  );

-- ─── Businesses ──────────────────────────────────────────────
CREATE POLICY "Anyone can view active businesses"
  ON businesses FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Owners can view own business"
  ON businesses FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert business"
  ON businesses FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update own business"
  ON businesses FOR UPDATE USING (owner_id = auth.uid());

-- ─── Services ────────────────────────────────────────────────
CREATE POLICY "Anyone can view available services"
  ON services FOR SELECT USING (is_available = TRUE);

CREATE POLICY "Business owners can manage services"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = services.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

-- ─── Appointments ────────────────────────────────────────────
CREATE POLICY "Customers can view own appointments"
  ON appointments FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Business owners can view their appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = appointments.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create appointments"
  ON appointments FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can cancel own appointments"
  ON appointments FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (status = 'cancelled');

CREATE POLICY "Business owners can update appointment status"
  ON appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = appointments.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

-- Allow checking slot availability (needed for availability checks)
CREATE POLICY "Anyone can check slot availability"
  ON appointments FOR SELECT
  USING (TRUE);

-- ─── Reviews ─────────────────────────────────────────────────
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT USING (TRUE);

CREATE POLICY "Customers can leave reviews for completed appointments"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = reviews.appointment_id
        AND appointments.customer_id = auth.uid()
        AND appointments.status = 'completed'
    )
  );

-- ============================================================
-- SEED DATA (optional — for demo/testing)
-- ============================================================

-- You can run this after creating your first owner account
-- Replace 'YOUR_OWNER_UUID' with the actual UUID from auth.users

/*
INSERT INTO businesses (owner_id, name, category, description, location, is_active, working_hours)
VALUES (
  'YOUR_OWNER_UUID',
  'Bloom Salon',
  'Salon',
  'A premium hair and beauty salon in the heart of downtown.',
  '123 Main Street, New York, NY',
  TRUE,
  '{
    "monday": {"open": "09:00", "close": "18:00", "enabled": true},
    "tuesday": {"open": "09:00", "close": "18:00", "enabled": true},
    "wednesday": {"open": "09:00", "close": "18:00", "enabled": true},
    "thursday": {"open": "09:00", "close": "20:00", "enabled": true},
    "friday": {"open": "09:00", "close": "20:00", "enabled": true},
    "saturday": {"open": "10:00", "close": "17:00", "enabled": true},
    "sunday": {"open": "10:00", "close": "15:00", "enabled": false}
  }'::jsonb
);
*/
