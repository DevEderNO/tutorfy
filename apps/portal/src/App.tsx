import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { PortalAuthProvider, usePortalAuth } from "@/lib/auth";
import { SelectedStudentProvider } from "@/lib/selected-student";
import { AppLayout } from "@/layout/AppLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { HomePage } from "@/features/home/HomePage";
import { ClassesPage } from "@/features/classes/ClassesPage";
import { EvolutionPage } from "@/features/evolution/EvolutionPage";
import { MaterialsPage } from "@/features/materials/MaterialsPage";
import { StudentsListPage } from "@/features/students/StudentsListPage";
import { StudentDetailPage } from "@/features/students/StudentDetailPage";
import { ProfilePage } from "@/features/profile/ProfilePage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 30 } },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = usePortalAuth();
  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function GuardianRoute({ children }: { children: React.ReactNode }) {
  const { isGuardian } = usePortalAuth();
  return isGuardian ? <>{children}</> : <Navigate to="/" replace />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <PortalAuthProvider>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              element={
                <PrivateRoute>
                  <SelectedStudentProvider>
                    <AppLayout />
                  </SelectedStudentProvider>
                </PrivateRoute>
              }
            >
              <Route path="/" element={<HomePage />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/evolution" element={<EvolutionPage />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route
                path="/students"
                element={
                  <GuardianRoute>
                    <StudentsListPage />
                  </GuardianRoute>
                }
              />
              <Route
                path="/students/:studentId"
                element={<StudentDetailPage />}
              />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PortalAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
