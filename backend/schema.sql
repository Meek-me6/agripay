-- AgriPay PostgreSQL Schema
-- Run this in your Railway Postgres console (railway run psql $DATABASE_URL < schema.sql)
-- or paste into any psql client connected to your Railway database.

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Farmers (users)
CREATE TABLE IF NOT EXISTS farmers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  phone            TEXT NOT NULL UNIQUE,
  region           TEXT NOT NULL,
  pin_hash         TEXT NOT NULL,
  coop_group       TEXT DEFAULT 'General Cooperative',
  wallet_balance   NUMERIC(12,2) DEFAULT 0,
  coop_savings     NUMERIC(12,2) DEFAULT 0,
  credit_score     INT DEFAULT 300,
  moolre_account_id TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Crop prices
CREATE TABLE IF NOT EXISTS prices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop        TEXT NOT NULL,
  market      TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  unit        TEXT NOT NULL,
  trend       TEXT CHECK (trend IN ('up','down','flat')) DEFAULT 'flat',
  change_pct  TEXT DEFAULT '0%',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace listings
CREATE TABLE IF NOT EXISTS listings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id    UUID REFERENCES farmers(id) ON DELETE CASCADE,
  crop         TEXT NOT NULL,
  quantity     TEXT NOT NULL,
  quantity_num NUMERIC(10,2),
  price        NUMERIC(10,2) NOT NULL,
  unit         TEXT NOT NULL,
  location     TEXT NOT NULL,
  condition    TEXT DEFAULT 'Grade A',
  in_escrow    BOOLEAN DEFAULT FALSE,
  escrow_ref   TEXT,
  active       BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Subsidy applications
CREATE TABLE IF NOT EXISTS subsidies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id    UUID REFERENCES farmers(id) ON DELETE CASCADE,
  programme    TEXT NOT NULL,
  amount       NUMERIC(10,2) NOT NULL,
  status       TEXT CHECK (status IN ('allocated','verified','pending','disbursed')) DEFAULT 'allocated',
  allocated_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at  TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ,
  transfer_ref TEXT,
  items        JSONB DEFAULT '[]'
);

-- Cooperative contributions
CREATE TABLE IF NOT EXISTS coop_contributions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id   UUID REFERENCES farmers(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL,
  method      TEXT DEFAULT 'MTN MoMo',
  payment_ref TEXT,
  confirmed   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Loan applications
CREATE TABLE IF NOT EXISTS loans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id         UUID REFERENCES farmers(id) ON DELETE CASCADE,
  amount            NUMERIC(10,2) NOT NULL,
  term_months       INT NOT NULL,
  purpose           TEXT,
  monthly_payment   NUMERIC(10,2),
  status            TEXT CHECK (status IN ('pending','approved','active','repaid','rejected')) DEFAULT 'pending',
  paid_installments INT DEFAULT 0,
  transfer_ref      TEXT,
  disbursed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Activity feed
CREATE TABLE IF NOT EXISTS activity (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id  UUID REFERENCES farmers(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  text       TEXT NOT NULL,
  icon       TEXT DEFAULT 'information-circle-outline',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial crop prices
INSERT INTO prices (crop, market, price, unit, trend, change_pct) VALUES
  ('Maize',        'Techiman', 220,  '100kg bag',  'up',   '+5%'),
  ('Cocoa',        'Kumasi',   1850, '64kg bag',   'up',   '+2%'),
  ('Cassava',      'Ejura',    95,   '100kg bag',  'down', '-3%'),
  ('Tomato',       'Techiman', 480,  'crate',      'down', '-8%'),
  ('Rice (paddy)', 'Tamale',   310,  '100kg bag',  'flat', '0%'),
  ('Yam',          'Ejura',    140,  '100 tubers', 'up',   '+4%'),
  ('Groundnuts',   'Tamale',   280,  '100kg bag',  'up',   '+7%'),
  ('Sorghum',      'Wa',       195,  '100kg bag',  'flat', '0%'),
  ('Plantain',     'Kumasi',   60,   'bunch',      'up',   '+10%'),
  ('Onion',        'Techiman', 320,  'bag (50kg)', 'down', '-5%')
ON CONFLICT DO NOTHING;
