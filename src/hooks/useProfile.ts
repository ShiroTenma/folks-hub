import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export function useProfile(targetId?: string) {
  const { user: authUser, profile: currentUserProfile, fetchProfile } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    division: '',
    batch: '',
    role: '',
    contact: '',
    email: '',
    password: '',
  });

  const effectiveId = targetId || authUser?.id;
  const isOwnProfile = effectiveId === authUser?.id;

  const loadData = useCallback(async () => {
    if (!effectiveId) return;
    setIsLoading(true);

    try {
      if (isOwnProfile && currentUserProfile) {
        setProfile(currentUserProfile);
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', effectiveId)
          .single();
        
        if (error) throw error;
        setProfile(data);
      }
    } catch (err) {
      console.error('[useProfile] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveId, isOwnProfile, currentUserProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        student_id: profile.student_id || '',
        division: profile.division || '',
        batch: profile.batch || '',
        role: profile.role || '',
        contact: profile.contact || '',
        email: isOwnProfile ? authUser?.email || '' : profile.contact || '',
        password: '',
      });
    }
  }, [profile, isOwnProfile, authUser]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !authUser) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${authUser.id}/${Math.random()}.${fileExt}`;

    setIsUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', authUser.id);

      if (updateError) throw updateError;

      toast.success('Profile picture updated successfully');
      await fetchProfile(authUser.id);
      await loadData();
    } catch (error: any) {
      console.error('[useProfile] Avatar Upload Error:', error);
      toast.error('Error uploading avatar: ' + (error.message || 'Check your connection'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!authUser || !effectiveId) return;
    setIsUpdating(true);

    try {
      // 1. Auth Updates (Only if it's own profile)
      if (isOwnProfile) {
        if (formData.email !== authUser.email) {
          const { error: emailError } = await supabase.auth.updateUser({ email: formData.email });
          if (emailError) throw emailError;
          toast.info('Verification email sent to new address');
        }

        if (formData.password && formData.password.trim().length > 0) {
          const { error: pwdError } = await supabase.auth.updateUser({ password: formData.password });
          if (pwdError) throw pwdError;
          toast.success('Password updated successfully');
          setFormData(prev => ({ ...prev, password: '' })); // Clear password after success
        }
      }

      // 2. Profile Data Update
      const updateData: any = {
        full_name: formData.full_name,
        student_id: formData.student_id,
        batch: formData.batch,
        contact: formData.contact,
        division: formData.division,
      };

      // Only Super Admins can change roles
      if ((currentUserProfile?.access_level === 'super_admin' || currentUserProfile?.role === 'super_admin')) {
        updateData.role = formData.role;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', effectiveId);

      if (profileError) throw profileError;

      toast.success('Profile updated successfully');
      if (isOwnProfile) {
        await fetchProfile(authUser.id);
      }
      await loadData();
      return true;
    } catch (error: any) {
      console.error('[useProfile] Update Error:', error);
      toast.error('Error updating profile: ' + (error.message || 'Check your connection'));
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    user: authUser,
    profile,
    formData,
    setFormData,
    isUpdating,
    isUploading,
    isLoading,
    isOwnProfile,
    handleAvatarUpload,
    handleUpdateProfile
  };
}
