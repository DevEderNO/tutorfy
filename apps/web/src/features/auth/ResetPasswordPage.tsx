import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import {
  GraduationCap,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ShieldCheck,
  KeyRound,
  AlertCircle,
} from "lucide-react";

type PageState = "form" | "success" | "error";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageState, setPageState] = useState<PageState>(
    token ? "form" : "error"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não conferem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", { token, password });
      setPageState("success");
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Erro ao redefinir senha";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
        {/* LEFT SIDE: Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center relative">
          {/* Back Link */}
          <Link
            to="/login"
            className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </Link>

          {/* Header */}
          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-8">
              <div className="h-10 w-10 gradient-primary rounded-xl flex items-center justify-center text-white">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-primary">
                Tutorfy
              </h2>
            </div>
            <h1 className="text-3xl font-bold mb-3 text-foreground">
              Redefinir Senha
            </h1>
            <p className="text-muted-foreground">
              Escolha uma nova senha para sua conta
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          {/* No Token State */}
          {pageState === "error" && !token && (
            <div className="text-center p-8 bg-destructive/5 border border-destructive/20 rounded-2xl">
              <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mx-auto mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Link inválido
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                O link de recuperação é inválido ou está incompleto. Solicite um
                novo link de recuperação.
              </p>
              <Link
                to="/recover-password"
                className="text-sm font-bold text-primary hover:underline"
              >
                Solicitar novo link
              </Link>
            </div>
          )}

          {/* Form */}
          {pageState === "form" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-semibold mb-2 text-slate-300"
                >
                  Nova senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all outline-none"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-semibold mb-2 text-slate-300"
                >
                  Confirmar nova senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all outline-none"
                    placeholder="Repita a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={
                      showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary hover:opacity-90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Redefinindo..." : "Redefinir senha"}
              </button>
            </form>
          )}

          {/* Success State */}
          {pageState === "success" && (
            <div className="text-center p-8 bg-success/5 border border-success/20 rounded-2xl">
              <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Senha redefinida!
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Sua senha foi alterada com sucesso. Agora você pode fazer login
                com sua nova senha.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="gradient-primary hover:opacity-90 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
              >
                Ir para o login
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground">
              © 2025 Tutorfy - Gestão Inteligente para Professores.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Security Illustration */}
        <div className="hidden md:flex bg-primary/10 relative items-center justify-center p-12 overflow-hidden">
          <div className="absolute -top-[10%] -right-[10%] w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-[5%] -left-[5%] w-80 h-80 bg-primary/10 rounded-full blur-[80px]" />

          <div className="relative z-10 text-center">
            <div className="glass p-8 rounded-3xl shadow-xl mb-8 max-w-sm mx-auto">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Lock className="h-16 w-16 text-primary/20" />
                  <KeyRound className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">
                Defina uma senha forte
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Recomendamos uma senha com no mínimo 6 caracteres, combinando
                letras maiúsculas, minúsculas e números.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-primary/40">
              <ShieldCheck className="h-8 w-8" />
              <Lock className="h-8 w-8" />
              <KeyRound className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
