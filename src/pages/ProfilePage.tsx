import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLES, BATCH_YEARS, DIVISIONS } from '@/lib/constants';
import { toast } from 'sonner';
import { Camera, Loader2, User, Mail, Hash, Briefcase, Calendar, Shield, Save } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProfilePage() {
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
        password: '', // Password remains empty unless user wants to change it
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
      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      toast.success('Profile picture updated!');
      if (user?.id) fetchProfile(user.id);
    } catch (error: any) {
      toast.error('Error uploading avatar: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // 1. Update Auth Email if changed
      if (formData.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: formData.email });
        if (emailError) throw emailError;
        toast.info('Verification email sent to new address');
      }

      // 2. Update Auth Password if provided
      if (formData.password) {
        const { error: pwdError } = await supabase.auth.updateUser({ password: formData.password });
        if (pwdError) throw pwdError;
        toast.success('Password updated successfully');
      }

      // 3. Update Profile Database
      const updateData: any = {
        full_name: formData.full_name,
        student_id: formData.student_id,
        batch: formData.batch,
        contact: formData.contact,
        division: formData.division,
      };

      // Only super_admin can change role
      if (profile?.role === 'super_admin') {
        updateData.role = formData.role;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user?.id);

      if (profileError) throw profileError;

      toast.success('Profile updated successfully');
      if (user?.id) fetchProfile(user.id);
    } catch (error: any) {
      toast.error('Error updating profile: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const isSuperAdmin = profile?.role === 'super_admin';
  const isAdmin = profile?.role === 'admin';
  const isRestricted = !isSuperAdmin && !isAdmin;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center gap-6"
      >
        <div className="relative group">
          <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-1 ring-slate-200">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-indigo-600 text-white text-3xl font-bold">
              {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <label 
            htmlFor="avatar-upload" 
            className="absolute bottom-0 right-0 h-10 w-10 bg-indigo-600 rounded-full border-4 border-white flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg"
          >
            {isUploading ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Camera className="h-4 w-4 text-white" />}
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
          </label>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{profile?.full_name || 'Your Profile'}</h1>
          <p className="text-slate-500 font-medium">{user?.email}</p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ROLES.find(r => r.id === profile?.role)?.color || 'bg-slate-100 text-slate-600'}`}>
              {ROLES.find(r => r.id === profile?.role)?.label || profile?.role}
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">
              {profile?.status || 'Active'}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <form onSubmit={handleUpdateProfile}>
            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your personal details and organization info.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <Input 
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="pl-9 rounded-xl border-slate-200 bg-slate-50 h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Student ID (NIM)</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <Input 
                        value={formData.student_id}
                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                        className="pl-9 rounded-xl border-slate-200 bg-slate-50 h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Division</Label>
                    <Select 
                      disabled={isRestricted}
                      value={formData.division}
                      onValueChange={(val) => setFormData({ ...formData, division: val })}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-slate-300" />
                          <SelectValue placeholder="Select Division" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {DIVISIONS.map(div => (
                          <SelectItem key={div} value={div}>{div}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Batch Year</Label>
                    <Select 
                      value={formData.batch}
                      onValueChange={(val) => setFormData({ ...formData, batch: val })}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-300" />
                          <SelectValue placeholder="Select Batch" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {BATCH_YEARS.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Contact / Email (Profile)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input 
                      disabled={isRestricted}
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      placeholder="Your public contact info"
                      className="pl-9 rounded-xl border-slate-200 bg-slate-50 h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8">
              <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    Account Security
                  </CardTitle>
                  <CardDescription>Manage your login credentials and system role.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Login Email</Label>
                      <Input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-xl border-slate-200 bg-slate-50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">New Password</Label>
                      <Input 
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="rounded-xl border-slate-200 bg-slate-50 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">System Role</Label>
                    <Select 
                      disabled={!isSuperAdmin}
                      value={formData.role}
                      onValueChange={(val) => setFormData({ ...formData, role: val })}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map(role => (
                          <SelectItem key={role.id} value={role.id}>{role.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!isSuperAdmin && (
                      <p className="text-[10px] text-slate-400 font-medium italic mt-1">
                        * Only Super Admins can modify account roles.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 flex justify-end">
              <Button 
                type="submit" 
                disabled={isUpdating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex gap-2"
              >
                {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                SAVE CHANGES
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm bg-indigo-600 text-white overflow-hidden">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Profile Completeness</h3>
              <div className="w-full bg-indigo-500/50 rounded-full h-2 mb-4">
                <div className="bg-white h-2 rounded-full w-[85%]"></div>
              </div>
              <p className="text-indigo-100 text-sm">Your profile is almost complete! Adding a profile picture and contact info helps your team identify you better.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-2 border-b border-slate-50">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Last Login</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-300" />
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Just now'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
