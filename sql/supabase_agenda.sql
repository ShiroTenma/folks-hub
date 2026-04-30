-- SCRIPT UNTUK MENAMBAH TABEL AGENDA (Jika ingin memisahkan antara Task dan Agenda)
-- Namun untuk saat ini kita bisa menggunakan tabel TASKS sebagai sumber agenda.
-- Jika di masa depan ingin ada tabel khusus Event/Agenda, jalankan script ini:

CREATE TABLE public.agendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  type TEXT DEFAULT 'Meeting', -- Meeting, Event, Deadline
  division TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agendas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON public.agendas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.agendas FOR INSERT TO authenticated WITH CHECK (true);

-- CATATAN: Untuk grafik Finance per bulan, kita akan menggunakan agregasi 
-- dari tabel TRANSACTIONS yang sudah ada.
