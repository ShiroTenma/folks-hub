-- 1. Table for Monthly Cash Payments
CREATE TABLE public.monthly_cash (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- e.g., '2024-05'
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, approved, rejected
  proof_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, month)
);

-- 2. Table for Split Bills
CREATE TABLE public.split_bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  total_amount NUMERIC NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table for Split Bill Items (Individual Assignments)
CREATE TABLE public.split_bill_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID REFERENCES public.split_bills(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, paid, approved
  proof_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.monthly_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_bill_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated read" ON public.monthly_cash FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON public.split_bills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON public.split_bill_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own cash payments" ON public.monthly_cash 
FOR ALL TO authenticated USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage own split bill items" ON public.split_bill_items 
FOR ALL TO authenticated USING (auth.uid() = profile_id);

CREATE POLICY "Admins can manage all finance" ON public.monthly_cash 
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);

CREATE POLICY "Admins can manage split bills" ON public.split_bills 
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);

CREATE POLICY "Admins can manage all split items" ON public.split_bill_items 
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);
