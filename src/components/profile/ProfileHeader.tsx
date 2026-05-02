import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { ROLES } from '@/lib/constants';
import { motion } from 'motion/react';
import { type Profile } from '@/lib/supabase';

interface ProfileHeaderProps {
  profile: Profile | null;
  email?: string;
  isUploading: boolean;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({
  profile,
  email,
  isUploading,
  onAvatarUpload
}: ProfileHeaderProps) {
  return (
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
            onChange={onAvatarUpload}
            disabled={isUploading}
          />
        </label>
      </div>
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{profile?.full_name || 'Your Profile'}</h1>
        <p className="text-slate-500 font-medium">{email}</p>
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
  );
}
