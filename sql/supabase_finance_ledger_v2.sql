-- Update Transactions table with new fields
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS event_type TEXT,
ADD COLUMN IF NOT EXISTS item_name TEXT,
ADD COLUMN IF NOT EXISTS debt_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS credit_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS division_target TEXT,
ADD COLUMN IF NOT EXISTS from_entity TEXT,
ADD COLUMN IF NOT EXISTS to_entity TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS payment_type TEXT,
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update RLS for transactions to ensure BPH can also manage
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.transactions;
CREATE POLICY "Allow authenticated read access" ON public.transactions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert transactions" ON public.transactions;
CREATE POLICY "Allow authenticated insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions;
CREATE POLICY "Admins can manage all transactions" ON public.transactions 
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('super_admin', 'admin') OR division = 'BPH'))
);
