-- Add payment_type to monthly_cash
ALTER TABLE public.monthly_cash ADD COLUMN IF NOT EXISTS payment_type TEXT;

-- Add Ledger settings
INSERT INTO public.settings (key, value) VALUES 
('ledger_events', '["Opening Balance", "WP", "Equipment", "Misc", "Cash", "Operational Expense", "WP Staff", "Merchandise", "Sertijab", "PnC", "Open House", "Commission", "SPIN", "ETAM"]'),
('ledger_payment_types', '["DANA", "BNI", "Cash"]')
ON CONFLICT (key) DO NOTHING;
