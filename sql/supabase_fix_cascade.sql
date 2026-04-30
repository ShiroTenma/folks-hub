-- SCRIPT UNTUK MEMUNGKINKAN PERUBAHAN ID PROFIL (PENTING UNTUK SYNC AUTH)
-- Script ini mengubah foreign key agar otomatis ikut berubah (CASCADE) saat ID Profil diperbarui.

-- 1. Perbaiki Foreign Key di tabel TASKS
ALTER TABLE public.tasks 
DROP CONSTRAINT IF EXISTS tasks_pic_id_fkey,
ADD CONSTRAINT tasks_pic_id_fkey 
  FOREIGN KEY (pic_id) 
  REFERENCES public.profiles(id) 
  ON UPDATE CASCADE 
  ON DELETE SET NULL;

-- 2. Perbaiki Foreign Key di tabel TRANSACTIONS
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_approved_by_fkey,
ADD CONSTRAINT transactions_approved_by_fkey 
  FOREIGN KEY (approved_by) 
  REFERENCES public.profiles(id) 
  ON UPDATE CASCADE 
  ON DELETE SET NULL;

-- 3. Pastikan kolom contact di tabel profiles unik (untuk memudahkan pencarian di Edge Function)
-- Jalankan ini hanya jika belum ada indeks unik
-- CREATE UNIQUE INDEX IF NOT EXISTS profiles_contact_idx ON public.profiles (contact);
