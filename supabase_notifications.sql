-- 4. Tabel NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' NOT NULL, -- info, warning, success, error
  read BOOLEAN DEFAULT false NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Jika spesifik ke user tertentu, null jika broadcast
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.notifications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete" ON public.notifications FOR DELETE TO authenticated USING (true);
