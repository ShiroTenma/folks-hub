import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, LogOut, Menu, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { APP_CONFIG, ROLES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, profile } = useAuthStore();
  const [hasUnread, setHasUnread] = React.useState(false);
  
  React.useEffect(() => {
    if (!user) return;
    const checkUnread = async () => {
      const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false);
      setHasUnread((count || 0) > 0);
    };
    checkUnread();
    const subscription = supabase.channel('unread_notifications').on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, checkUnread).subscribe();
    return () => { subscription.unsubscribe(); };
  }, [user]);

  const handleLogout = async () => { await supabase.auth.signOut(); };
  const roleConfig = ROLES.find(r => r.id === profile?.role);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-[#dcd7cf] px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden h-12 w-12 text-[#1c1c1c] hover:bg-[#eae6e0] rounded-2xl" onClick={onMenuClick}>
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#535366] uppercase tracking-[0.3em] leading-none">{APP_CONFIG.NAME}</span>
            <div className="h-1 w-1 rounded-full bg-[#535366]/20" />
          </div>
          <span className="text-sm font-heading italic font-black text-[#1c1c1c] mt-1">Management Portal</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-8">
        <Link to="/notifications">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-[#eae6e0] relative transition-all duration-300 group">
            <Bell className="h-5 w-5 text-[#535366] group-hover:text-[#1c1c1c]" />
            {hasUnread && (
              <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
            )}
          </Button>
        </Link>
        
        <div className="h-10 w-px bg-[#dcd7cf] mx-1 hidden md:block" />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-[#eae6e0]/50 px-2 py-1.5 rounded-2xl transition-all focus-visible:outline-none group">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-[#1c1c1c] leading-none group-hover:text-[#535366] transition-colors">{profile?.full_name || 'User'}</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <ShieldCheck className="h-3 w-3 text-[#535366]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#535366]/60">
                  {roleConfig?.label || profile?.role || 'Member'}
                </span>
              </div>
            </div>
            <Avatar className="h-11 w-11 border-2 border-white shadow-xl ring-1 ring-[#dcd7cf] transition-transform active:scale-90 duration-300">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-[#535366] text-white text-xs font-black">
                {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-3xl border-[#dcd7cf] shadow-2xl mt-4 p-3 bg-white/95 backdrop-blur-xl">
            <div className="px-4 py-3 sm:hidden border-b border-[#eae6e0] mb-2">
              <p className="text-sm font-heading font-black text-[#1c1c1c] italic">{profile?.full_name}</p>
              <p className="text-[10px] text-[#535366] font-black uppercase tracking-widest mt-1">{profile?.role}</p>
            </div>
            <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#535366]/40">Organization Access</div>
            <DropdownMenuSeparator className="bg-[#eae6e0] my-2" />
            <Link to="/profile">
              <DropdownMenuItem className="gap-3 py-4 px-4 rounded-2xl cursor-pointer focus:bg-[#eae6e0] group">
                <div className="h-8 w-8 rounded-xl bg-[#eae6e0] flex items-center justify-center text-[#535366] group-focus:bg-white group-focus:text-[#1c1c1c] transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-[#1c1c1c]">Profile Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={handleLogout} className="gap-3 py-4 px-4 rounded-2xl cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700 group mt-1">
              <div className="h-8 w-8 rounded-xl bg-rose-50 flex items-center justify-center group-focus:bg-white transition-colors">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold">Sign Out Session</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
