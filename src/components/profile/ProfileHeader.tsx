import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, ShieldCheck, Mail } from 'lucide-react';
import { ROLES } from '@/lib/constants';
import { motion } from 'motion/react';
import { type Profile } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
  profile: Profile | null;
  email?: string;
  isUploading: boolean;
  onAvatarUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({
  profile, email, isUploading, onAvatarUpload
}: ProfileHeaderProps) {
  const roleConfig = ROLES.find(r => r.id === profile?.role);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col lg:flex-row items-center lg:items-end gap-10 mb-16"
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-[#1c1c1c] rounded-[3rem] rotate-6 scale-95 opacity-5 group-hover:rotate-12 transition-all duration-500" />
        <Avatar className="h-44 w-44 rounded-[3rem] border-8 border-white shadow-2xl shadow-black/10 relative z-10">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="bg-[#1c1c1c] text-white text-4xl font-heading font-black">
            {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        {onAvatarUpload && (
          <label 
            htmlFor="avatar-upload" 
            className="absolute -bottom-2 -right-2 h-14 w-14 bg-[#1c1c1c] text-white rounded-2xl border-4 border-white flex items-center justify-center cursor-pointer hover:bg-[#535366] transition-all shadow-xl z-20 hover:scale-110 active:scale-90"
          >
            {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={onAvatarUpload} disabled={isUploading} />
          </label>
        )}
      </div>

      <div className="text-center lg:text-left space-y-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center justify-center lg:justify-start gap-3 text-[#535366]/40 mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Verified Organization Identity</span>
          </div>
          <h1 className="text-5xl font-heading font-black tracking-tight text-[#1c1c1c]">
            {profile?.full_name || 'Anonymous User'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
          <div className="flex items-center gap-2 text-[#535366]/60 bg-white/50 border border-[#dcd7cf] px-4 py-2 rounded-xl backdrop-blur-sm">
            <Mail className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">{email || 'No contact established'}</span>
          </div>

          <div className="flex gap-2">
            <span className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border-none",
              roleConfig?.color || 'bg-[#1c1c1c] text-white'
            )}>
              {roleConfig?.label || profile?.role}
            </span>
            <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
              {profile?.status || 'Active'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
