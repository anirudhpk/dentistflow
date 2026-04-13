CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL UNIQUE,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  chief_complaint TEXT NOT NULL,
  visit_type TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  lifecycle_stage TEXT NOT NULL DEFAULT 'New patient',
  next_follow_up_date TEXT NOT NULL DEFAULT '',
  follow_up_note TEXT NOT NULL DEFAULT '',
  symptoms TEXT NOT NULL DEFAULT '',
  diagnosis TEXT NOT NULL DEFAULT '',
  recommended_medicines TEXT NOT NULL DEFAULT '',
  invoice_number TEXT NOT NULL DEFAULT '',
  invoice_items TEXT NOT NULL DEFAULT '',
  invoice_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  invoice_status TEXT NOT NULL DEFAULT 'Unpaid',
  invoice_notes TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients (phone);
CREATE INDEX IF NOT EXISTS idx_patients_invoice_number ON patients (invoice_number);
