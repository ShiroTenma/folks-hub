import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export function useProfile() {
  const { user, profile, fetchProfile } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
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

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        student_id: profile.student_id || '',
        division: profile.division || '',
        batch: profile.batch || '',
        role: profile.role || '',
        contact: profile.contact || '',
        email: user?.email || '',
        password: '',
      });
    }
  }, [profile, user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user?.id}/${Math.random()}.${fileExt}`;

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
        .eq('id', user?.id);

      if (updateError) throw updateError;

      toast.success('Profile picture updated successfully');
      if (user?.id) await fetchProfile(user.id);
    } catch (error: any) {
      console.error('[useProfile] Avatar Upload Error:', error);
      toast.error('Error uploading avatar: ' + (error.message || 'Check your connection'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsUpdating(true);

    try {
      if (formData.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: formData.email });
        if (emailError) throw emailError;
        toast.info('Verification email sent to new address');
      }

      if (formData.password) {
        const { error: pwdError } = await supabase.auth.updateUser({ password: formData.password });
        if (pwdError) throw pwdError;
        toast.success('Password updated successfully');
      }

      const updateData: any = {
        full_name: formData.full_name,
        student_id: formData.student_id,
        batch: formData.batch,
        contact: formData.contact,
        division: formData.division,
      };

      if (profile?.role === 'super_admin') {
        updateData.role = formData.role;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user?.id);

      if (profileError) throw profileError;

      toast.success('Profile updated successfully');
      if (user?.id) await fetchProfile(user.id);
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
    user,
    profile,
    formData,
    setFormData,
    isUpdating,
    isUploading,
    handleAvatarUpload,
    handleUpdateProfile
  };
}
