import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuthListener } from '@/hooks/useAuthListener';
import { Toaster } from '@/components/ui/sonner';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingScreen } from '@/components/layout/LoadingScreen';

// Lazy load pages for performance
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TasksPage = lazy(() => import('@/pages/TasksPage').then(m => ({ default: m.TasksPage })));
const MembersPage = lazy(() => import('@/pages/MembersPage').then(m => ({ default: m.MembersPage })));
const FinancePage = lazy(() => import('@/pages/FinancePage').then(m => ({ default: m.FinancePage })));
const MonthlyCashPage = lazy(() => import('@/pages/MonthlyCashPage'));
const SplitBillPage = lazy(() => import('@/pages/SplitBillPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

export default function App() {
  const { user } = useAuthStore();
  const { isLoading } = useAuthListener();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors closeButton />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public Routes */}
          {!user ? (
            <>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            /* Protected Routes wrapped in AppShell */
            <Route
              path="*"
              element={
                <AppShell>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/members" element={<MembersPage />} />
                    
                    {/* Finance Sub-routes */}
                    <Route path="/finance" element={<FinancePage />} />
                    <Route path="/finance/monthly" element={<MonthlyCashPage />} />
                    <Route path="/finance/split" element={<SplitBillPage />} />
                    
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </AppShell>
              }
            />
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
