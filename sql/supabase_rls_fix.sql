-- SCRIPT UNTUK MEMBUKA AKSES CRUD (INSERT, UPDATE, DELETE)
-- Jalankan ini di SQL Editor Supabase jika Anda mendapatkan error 403 Forbidden saat menambah/mengubah data.

-- 1. Izin untuk tabel PROFILES
-- Mengizinkan user yang sudah login untuk menambah data profil (penting untuk Register & Add Member)
CREATE POLICY "Allow authenticated insert profiles" ON public.profiles 
FOR INSERT TO authenticated WITH CHECK (true);

-- 2. Izin untuk tabel TASKS
-- Mengizinkan CRUD penuh untuk user yang sudah login di papan Kanban
CREATE POLICY "Allow authenticated insert tasks" ON public.tasks 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update tasks" ON public.tasks 
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete tasks" ON public.tasks 
FOR DELETE TO authenticated USING (true);

-- 3. Izin untuk tabel TRANSACTIONS
-- Mengizinkan CRUD penuh untuk user yang sudah login di sistem Keuangan
CREATE POLICY "Allow authenticated insert transactions" ON public.transactions 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update transactions" ON public.transactions 
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete transactions" ON public.transactions 
FOR DELETE TO authenticated USING (true);
