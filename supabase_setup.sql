-- ==========================================
-- FOLKS HUB UNIFIED SUPABASE SETUP SCRIPT
-- Execute this entirely in your Supabase SQL Editor
-- ==========================================

-- 1. Create Core Tables

CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users on delete cascade,
  uid text,
  full_name text,
  role text,
  access_level text DEFAULT 'user',
  division text,
  batch text,
  avatar_url text,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);

CREATE TABLE public.tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo',
  division text,
  priority text,
  assigned_to text,
  deadline timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date timestamp with time zone DEFAULT timezone('utc'::text, now()),
  type text NOT NULL,
  item_name text NOT NULL,
  amount numeric NOT NULL,
  source text,
  status text DEFAULT 'completed',
  approved_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.monthly_cash (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  month date NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  payment_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(profile_id, month)
);

CREATE TABLE public.split_bills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  total_amount numeric NOT NULL,
  initiator_id uuid REFERENCES public.profiles(id),
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.split_bill_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  split_bill_id uuid REFERENCES public.split_bills(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES public.profiles(id),
  item_name text NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  proof_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  message text,
  type text,
  read boolean DEFAULT false,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);


-- 2. Enable Row Level Security (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;


-- 3. Create RLS Policies

-- Profiles: Anyone can view, users can update their own, admins can update any.
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Tasks: Authenticated users can view and manage tasks
CREATE POLICY "Tasks viewable by authenticated users" ON public.tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Tasks insertable by authenticated users" ON public.tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Tasks updatable by authenticated users" ON public.tasks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Tasks deletable by authenticated users" ON public.tasks FOR DELETE USING (auth.role() = 'authenticated');

-- Transactions (Ledger): Viewable by all authenticated, manageable by admins (or authenticated for demo)
CREATE POLICY "Transactions viewable by authenticated" ON public.transactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Transactions insertable by authenticated" ON public.transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Transactions updatable by authenticated" ON public.transactions FOR UPDATE USING (auth.role() = 'authenticated');

-- Monthly Cash
CREATE POLICY "Monthly cash viewable by authenticated" ON public.monthly_cash FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Monthly cash insertable by authenticated" ON public.monthly_cash FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Monthly cash updatable by authenticated" ON public.monthly_cash FOR UPDATE USING (auth.role() = 'authenticated');

-- Split Bills
CREATE POLICY "Split bills viewable by authenticated" ON public.split_bills FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Split bills insertable by authenticated" ON public.split_bills FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Split bills updatable by authenticated" ON public.split_bills FOR UPDATE USING (auth.role() = 'authenticated');

-- Split Bill Items
CREATE POLICY "Split bill items viewable by authenticated" ON public.split_bill_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Split bill items insertable by authenticated" ON public.split_bill_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Split bill items updatable by authenticated" ON public.split_bill_items FOR UPDATE USING (auth.role() = 'authenticated');

-- Notifications
CREATE POLICY "Notifications viewable by owner" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Notifications insertable by authenticated" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Notifications updatable by owner" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);


-- 4. Create Triggers (Auto-updated_at)

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
