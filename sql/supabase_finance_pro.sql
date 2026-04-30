-- Add Budget tracking to events (stored in a meta table or just unique event rows)
CREATE TABLE IF NOT EXISTS public.event_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT UNIQUE NOT NULL,
  budget_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure RLS for budgets
ALTER TABLE public.event_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read budgets" ON public.event_budgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage budgets" ON public.event_budgets FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')));

-- Add column for adjustment notes if needed
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS admin_adjustment_note TEXT;
