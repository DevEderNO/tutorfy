import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { RecoverPasswordPage } from "@/features/auth/RecoverPasswordPage";
import { ResetPasswordPage } from "@/features/auth/ResetPasswordPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { StudentsListPage } from "@/features/students/StudentsListPage";
import { StudentFormPage } from "@/features/students/StudentFormPage";
import { StudentDetailPage } from "@/features/students/StudentDetailPage";
import { SchedulePage } from "@/features/schedule/SchedulePage";
import { FinancialPage } from "@/features/financial/FinancialPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { StudentPortalPage } from "@/features/portal/StudentPortalPage";
import { ComponentsLayout } from "@/features/components/ComponentsLayout";
import { AtomsPage } from "@/features/components/AtomsPage";
import { MoleculesPage } from "@/features/components/MoleculesPage";
import { OrganismsPage } from "@/features/components/OrganismsPage";
import { Toaster } from "@/components/ui/toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/p/:token" element={<StudentPortalPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/recover-password"
                element={<RecoverPasswordPage />}
              />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/students" element={<StudentsListPage />} />
                <Route path="/students/new" element={<StudentFormPage />} />
                <Route
                  path="/students/:id/edit"
                  element={<StudentFormPage />}
                />
                <Route path="/students/:id" element={<StudentDetailPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/financial" element={<FinancialPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                {import.meta.env.DEV && (
                  <Route path="/components" element={<ComponentsLayout />}>
                    <Route index element={<Navigate to="/components/atoms" replace />} />
                    <Route path="atoms" element={<AtomsPage />} />
                    <Route path="molecules" element={<MoleculesPage />} />
                    <Route path="organisms" element={<OrganismsPage />} />
                  </Route>
                )}
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
      <Toaster />
    </GoogleOAuthProvider>
  );
}
