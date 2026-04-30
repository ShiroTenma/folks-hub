-- SCRIPT UNTUK MEMPERBAIKI ERROR 409 (FOREIGN KEY VIOLATION) PADA TABEL PROFILES
-- Jalankan ini di SQL Editor Supabase agar admin bisa menambah member secara manual tanpa harus membuat akun login terlebih dahulu.

-- 1. Menghapus batasan (constraint) yang mewajibkan ID profile harus terdaftar di tabel Auth
-- Hal ini memungkinkan kita menyimpan data member yang belum memiliki akun login.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Mengatur kolom ID agar otomatis menghasilkan UUID jika tidak diisi secara manual
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Memastikan Policy INSERT untuk tabel profiles sudah terpasang dengan benar
DROP POLICY IF EXISTS "Allow authenticated insert profiles" ON public.profiles;
CREATE POLICY "Allow authenticated insert profiles" ON public.profiles 
FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Memastikan Policy UPDATE untuk tabel profiles agar admin bisa mengedit data siapa saja
DROP POLICY IF EXISTS "Allow authenticated update profiles" ON public.profiles;
CREATE POLICY "Allow authenticated update profiles" ON public.profiles 
FOR UPDATE TO authenticated USING (true);

-- CATATAN: 
-- Jika Anda masih mendapatkan error 409, pastikan Student ID (NIM) yang Anda masukkan 
-- belum pernah terdaftar sebelumnya, karena kolom Student ID bersifat UNIQUE.
