import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from '@/components/Sidebar';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TasksPage } from '@/pages/TasksPage';
import { MembersPage } from '@/pages/MembersPage';
import { FinancePage } from '@/pages/FinancePage';
import NotificationsPage from '@/pages/NotificationsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { Toaster } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Bell, User, LogOut } from 'lucide-react';
import { APP_CONFIG, ROLES } from '@/lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function App() {
  const { user, profile, setUser, setProfile, fetchProfile } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const [subscription] = [supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    })];

    return () => subscription.data.subscription.unsubscribe();
  }, [setUser, setProfile, fetchProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 space-y-4 flex-col bg-slate-50">
        <Skeleton className="w-[80px] h-[80px] rounded-2xl bg-slate-200" />
        <div className="space-y-2 flex flex-col items-center">
          <Skeleton className="h-4 w-[150px] bg-slate-200" />
          <Skeleton className="h-4 w-[100px] bg-slate-200 opacity-60" />
        </div>
      </div>
    );
  }

  const roleConfig = ROLES.find(r => r.id === profile?.role);

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route
            path="*"
            element={
              <div className="flex min-h-screen bg-[#F8FAFC]">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all duration-300">
                  <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
                    <div className="flex items-center gap-4 text-slate-500 overflow-hidden">
                      <span className="text-sm hidden sm:inline truncate">{APP_CONFIG.DESCRIPTION}</span>
                      <span className="text-slate-300 hidden sm:inline">/</span>
                      <span className="text-sm font-semibold text-slate-800 truncate">{APP_CONFIG.NAME} Dashboard</span>
                    </div>
                    
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="flex items-center gap-2 md:gap-4">
                        <Link to="/notifications">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100 relative">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                          </Button>
                        </Link>
                        
                        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                            <div className="flex flex-col items-end hidden sm:flex">
                              <span className="text-xs font-bold text-slate-900 leading-none">{profile?.full_name || 'Loading...'}</span>
                              <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 px-1.5 py-0.5 rounded ${roleConfig?.color || 'bg-slate-100 text-slate-500'}`}>
                                {roleConfig?.label || profile?.role || 'Member'}
                              </span>
                            </div>
                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-200">
                              <AvatarImage src={profile?.avatar_url} />
                              <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                                {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-200 shadow-xl mt-2">
                            <div className="px-2 py-2 sm:hidden border-b border-slate-50 mb-1">
                              <p className="text-xs font-bold text-slate-900">{profile?.full_name}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{profile?.role}</p>
                            </div>
                            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Account System</div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 py-2.5 rounded-xl cursor-pointer">
                              <User className="h-4 w-4 text-slate-400" />
                              <span className="text-sm font-medium">My Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout} className="gap-2 py-2.5 rounded-xl cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-600">
                              <LogOut className="h-4 w-4" />
                              <span className="text-sm font-bold">Logout</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </header>
                  <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/tasks" element={<TasksPage />} />
                        <Route path="/members" element={<MembersPage />} />
                        <Route path="/finance" element={<FinancePage />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </div>
                  </main>
                </div>
              </div>
            }
          />
        )}
      </Routes>
    </BrowserRouter>
  );
}
