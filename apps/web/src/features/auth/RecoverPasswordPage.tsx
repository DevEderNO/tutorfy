import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import {
  GraduationCap,
  ArrowLeft,
  Mail,
  CheckCircle,
  ShieldCheck,
  Lock,
  KeyRound,
} from "lucide-react";

type PageState = "form" | "success";

export function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageState, setPageState] = useState<PageState>("form");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/request-reset", { email });
      setPageState("success");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Erro ao enviar link de recuperação"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setEmail("");
    setError("");
    setPageState("form");
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
              Recuperar Senha
            </h1>
            <p className="text-muted-foreground">
              Insira seu e-mail para receber as instruções
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          {/* Form */}
          {pageState === "form" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="recovery-email"
                  className="block text-sm font-semibold mb-2 text-slate-300"
                >
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                  <input
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-800/50 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all outline-none"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary hover:opacity-90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando..." : "Enviar link de recuperação"}
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
                E-mail enviado!
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Se o e-mail informado estiver cadastrado, você receberá um link
                para redefinir sua senha em instantes.
              </p>
              <button
                onClick={handleTryAgain}
                className="text-sm font-bold text-primary hover:underline"
              >
                Tentar outro e-mail
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
          {/* Decorative Blurs */}
          <div className="absolute -top-[10%] -right-[10%] w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-[5%] -left-[5%] w-80 h-80 bg-primary/10 rounded-full blur-[80px]" />

          <div className="relative z-10 text-center">
            {/* Security Card */}
            <div className="glass p-8 rounded-3xl shadow-xl mb-8 max-w-sm mx-auto">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Lock className="h-16 w-16 text-primary/20" />
                  <KeyRound className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">
                Mantenha sua conta segura
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Utilizamos criptografia de ponta para garantir que seus dados e
                sua agenda de aulas estejam sempre protegidos.
              </p>
            </div>

            {/* Security Icons */}
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
