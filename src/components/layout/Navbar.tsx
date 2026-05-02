import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, LogOut, Menu } from 'lucide-react';
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

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, profile } = useAuthStore();
  const [hasUnread, setHasUnread] = React.useState(false);
  
  React.useEffect(() => {
    if (!user) return;
    
    const checkUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      setHasUnread((count || 0) > 0);
    };

    checkUnread();

    const subscription = supabase
      .channel('unread_notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, checkUnread)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const roleConfig = ROLES.find(r => r.id === profile?.role);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-10 w-10 text-slate-500"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
            {APP_CONFIG.NAME}
          </span>
          <span className="text-sm font-bold text-slate-800 truncate">
            Organization Portal
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-6">
        <Link to="/notifications">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-100 relative">
            <Bell className="h-5 w-5 text-slate-500" />
            {hasUnread && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </Button>
        </Link>
        
        <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 md:gap-3 hover:bg-slate-50 p-1 md:p-1.5 rounded-xl transition-all focus-visible:outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-indigo-500">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-slate-900 leading-none">{profile?.full_name || 'User'}</span>
              <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 px-1.5 py-0.5 rounded ${roleConfig?.color || 'bg-slate-100 text-slate-500'}`}>
                {roleConfig?.label || profile?.role || 'Member'}
              </span>
            </div>
            <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-200 transition-transform active:scale-95">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-200 shadow-xl mt-2 p-2">
            <div className="px-3 py-2 sm:hidden border-b border-slate-100 mb-1">
              <p className="text-xs font-bold text-slate-900">{profile?.full_name}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">{profile?.role}</p>
            </div>
            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Account System</div>
            <DropdownMenuSeparator className="bg-slate-50" />
            <Link to="/profile">
              <DropdownMenuItem className="gap-2 py-3 rounded-xl cursor-pointer focus:bg-indigo-50 group">
                <User className="h-4 w-4 text-slate-400 group-focus:text-indigo-600" />
                <span className="text-sm font-bold text-slate-700 group-focus:text-indigo-900">My Profile</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="gap-2 py-3 rounded-xl cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-600 group"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-bold">Logout Session</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
