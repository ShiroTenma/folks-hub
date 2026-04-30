-- 1. Tabel PROFILES (Menyimpan data anggota)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  student_id TEXT UNIQUE NOT NULL,
  division TEXT NOT NULL,
  batch TEXT NOT NULL,
  role TEXT DEFAULT 'member' NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL,
  contact TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel TASKS (Sistem Manajemen Tugas)
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' NOT NULL, -- todo, in_progress, done
  division TEXT NOT NULL,
  pic_id UUID REFERENCES public.profiles(id),
  deadline TIMESTAMPTZ,
  progress_percent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel TRANSACTIONS (Sistem Keuangan)
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- income, expense
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, approved, rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AKTIFKAN RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- POLICY: Siapa saja yang login bisa melihat data (Read-only for authenticated)
CREATE POLICY "Allow authenticated read access" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON public.transactions FOR SELECT TO authenticated USING (true);

-- POLICY: User hanya bisa edit profil mereka sendiri
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
