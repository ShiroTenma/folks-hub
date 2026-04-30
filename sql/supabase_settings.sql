-- Table for Global App Settings
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated read" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings 
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);

-- Insert Default Settings
INSERT INTO public.settings (key, value) VALUES 
('monthly_cash_fee', '10000'),
('monthly_cash_months', '["Sep-2025", "Okt-2025", "Nov-2025", "Des-2025", "Jan-2026", "Feb-2026", "Mar-2026", "Apr-2026", "Mei-2026", "Jun-2026", "Jul-2026"]')
ON CONFLICT (key) DO NOTHING;
