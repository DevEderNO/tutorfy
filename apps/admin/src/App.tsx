import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { AdminAuthProvider, useAdminAuth } from './lib/auth';
import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { UsersListPage } from './features/users/UsersListPage';
import { UserDetailPage } from './features/users/UserDetailPage';
import { PlansPage } from './features/plans/PlansPage';
import { FinancialPage } from './features/financial/FinancialPage';
import { AdminsPage } from './features/admins/AdminsPage';
import { SettingsPage } from './features/settings/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-muted-foreground">Carregando...</div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, isLoading } = useAdminAuth();
  if (isLoading) return null;
  if (!isSuperAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAdminAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersListPage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />
        <Route
          path="/plans"
          element={<SuperAdminRoute><PlansPage /></SuperAdminRoute>}
        />
        <Route
          path="/financial"
          element={<SuperAdminRoute><FinancialPage /></SuperAdminRoute>}
        />
        <Route
          path="/admins"
          element={<SuperAdminRoute><AdminsPage /></SuperAdminRoute>}
        />
        <Route
          path="/settings"
          element={<SuperAdminRoute><SettingsPage /></SuperAdminRoute>}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminAuthProvider>
          <AppRoutes />
        </AdminAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
