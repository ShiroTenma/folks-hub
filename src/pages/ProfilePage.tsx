import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Info, Database, Loader2, Fingerprint, ShieldCheck, Activity } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/useAuthStore';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { cn } from '@/lib/utils';

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { profile: viewerProfile } = useAuthStore();
  useDocumentTitle(id ? 'Member Profile' : 'My Profile');
  
  const {
    user, profile, formData, setFormData, isUpdating, isUploading, isLoading, isOwnProfile,
    handleAvatarUpload, handleUpdateProfile
  } = useProfile(id);

  if (isLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="h-20 w-20 rounded-[2rem] bg-[#f4f2ef] flex items-center justify-center text-[#1c1c1c] border-2 border-[#dcd7cf] shadow-xl animate-pulse">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#535366]/40">Accessing Encrypted Profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-6 text-center">
        <div className="h-24 w-24 bg-[#f4f2ef] rounded-[2.5rem] border-2 border-[#dcd7cf] flex items-center justify-center text-[#535366]/20">
          <Database className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-heading font-black tracking-tight text-[#1c1c1c]">Context Missing</h2>
          <p className="text-[#535366]/40 font-black uppercase text-[10px] tracking-[0.2em]">The requested entity record was not found in registry.</p>
        </div>
      </div>
    );
  }

  const isAdmin = (viewerProfile?.access_level === 'super_admin' || viewerProfile?.access_level === 'admin' || viewerProfile?.role === 'super_admin' || viewerProfile?.role === 'admin');
  if (!isOwnProfile && !isAdmin) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-6 text-center">
        <div className="h-24 w-24 bg-rose-50 rounded-[2.5rem] border-2 border-rose-100 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10">
          <Fingerprint className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-heading font-black tracking-tight text-[#1c1c1c]">Access Denied</h2>
          <p className="text-[#535366]/40 font-black uppercase text-[10px] tracking-[0.2em]">Elevated clearance required for member oversight.</p>
        </div>
      </div>
    );
  }

  const canEdit = isAdmin || isOwnProfile;
  const isRestricted = !isAdmin; 

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20">
      <ProfileHeader 
        profile={profile} email={isOwnProfile ? user?.email : profile.contact}
        isUploading={isUploading} onAvatarUpload={canEdit ? handleAvatarUpload : undefined} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <ProfileForm 
            formData={formData} setFormData={setFormData} isUpdating={isUpdating}
            onUpdate={canEdit ? handleUpdateProfile : undefined}
            isSuperAdmin={viewerProfile?.role === 'super_admin'}
            readOnly={!canEdit} isRestricted={isRestricted}
          />
        </div>

        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-black/20 overflow-hidden bg-[#1c1c1c] text-white premium-shadow">
            <CardHeader className="border-b border-white/5 p-8 pb-6">
              <CardTitle className="text-[10px] font-black flex items-center gap-3 uppercase tracking-[0.3em] text-[#535366]">
                <Fingerprint className="h-4 w-4" /> System Context
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#535366]">Persistent Registry Identifier</p>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-mono text-[10px] text-white/40 break-all leading-relaxed">
                  {profile.id}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#535366]">Clearance Level</p>
                  <p className="text-xs font-black uppercase tracking-widest">{profile.role || 'MEMBER'}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-white/20" />
                </div>
              </div>
            </CardContent>
          </Card>

          {isOwnProfile && (
            <Card className="rounded-[2.5rem] border-2 border-[#dcd7cf] shadow-2xl shadow-black/5 overflow-hidden bg-white premium-shadow">
              <CardHeader className="bg-[#f4f2ef]/50 border-b-2 border-[#f4f2ef] p-8 pb-6">
                <CardTitle className="text-[10px] font-black flex items-center gap-3 uppercase tracking-[0.3em] text-[#535366]/40">
                  <Activity className="h-4 w-4" /> Session Telemetry
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4 text-xs font-bold text-[#1c1c1c]">
                  <div className="h-8 w-8 rounded-lg bg-[#f4f2ef] flex items-center justify-center">
                    <History className="h-4 w-4 text-[#535366]" />
                  </div>
                  Last verified interaction:
                </div>
                <div className="text-xs font-black text-[#1c1c1c] bg-[#f4f2ef] p-5 rounded-2xl border-2 border-[#dcd7cf] shadow-inner text-center tracking-tight">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('en-US', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                  }) : 'Establishing session...'}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
