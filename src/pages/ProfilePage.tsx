import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Info, Database } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProfile } from '@/hooks/useProfile';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileForm } from '@/components/profile/ProfileForm';

export default function ProfilePage() {
  useDocumentTitle('Profile');
  const {
    user,
    profile,
    formData,
    setFormData,
    isUpdating,
    isUploading,
    handleAvatarUpload,
    handleUpdateProfile
  } = useProfile();

  const isSuperAdmin = profile?.role === 'super_admin';
  const isAdmin = profile?.role === 'admin';
  const isRestricted = !isSuperAdmin && !isAdmin;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <ProfileHeader 
        profile={profile}
        email={user?.email}
        isUploading={isUploading}
        onAvatarUpload={handleAvatarUpload}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <ProfileForm 
            formData={formData}
            setFormData={setFormData}
            isUpdating={isUpdating}
            onUpdate={handleUpdateProfile}
            isSuperAdmin={isSuperAdmin}
            isRestricted={isRestricted}
          />
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-slate-900 text-white">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-indigo-400">
                <Database className="h-4 w-4" />
                System Context
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Account UID</p>
                <code className="text-[10px] bg-white/5 p-1 rounded block truncate font-mono text-slate-300">{user?.id}</code>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Level</p>
                <p className="text-xs font-bold">{profile?.role?.toUpperCase() || 'MEMBER'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-slate-600">
                <History className="h-4 w-4 text-indigo-600" />
                Session Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                <Info className="h-4 w-4 text-slate-300" />
                Last activity detected:
              </div>
              <div className="text-xs font-black text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Just now'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
