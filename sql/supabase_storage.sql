-- ==========================================
-- SETUP STORAGE FOR PROFILE PICTURES
-- ==========================================

-- 1. Create the 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Allow public access to view avatars
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- 3. Policy: Allow authenticated users to upload their own avatars
-- Path format: [user_id]/[filename]
CREATE POLICY "Users can upload their own avatars" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Policy: Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Policy: Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
