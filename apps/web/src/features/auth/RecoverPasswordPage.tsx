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
  Loader2,
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
        err.response?.data?.message || "Erro ao enviar link de recuperação",
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
    <div className="flex min-h-screen items-center justify-center bg-[#151022] p-4 font-inter">
      <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 glass-panel rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden border border-white/10 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none opacity-50"></div>

        {/* LEFT SIDE: Form */}
        <div className="p-10 md:p-20 flex flex-col justify-center relative z-10">
          {/* Back Link */}
          <Link
            to="/login"
            className="absolute top-10 left-10 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all group scale-105"
          >
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Voltar para o login
          </Link>

          {/* Header */}
          <div className="mb-12 text-center md:text-left mt-8 md:mt-0">
            <div className="inline-flex items-center gap-3 mb-10 group cursor-default">
              <div className="size-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(116,61,245,0.5)] group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-7 w-7 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-foreground">
                Tutorfy
              </h2>
            </div>
            <h1 className="text-4xl font-black mb-4 text-foreground tracking-tight leading-tight">
              Recuperar Senha
            </h1>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed">
              Insira seu e-mail para receber as instruções de acesso.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-8 rounded-2xl bg-destructive/10 p-5 text-sm font-bold text-destructive border border-destructive/20 flex items-center gap-3 shadow-[0_4px_15px_rgba(239,68,68,0.1)] animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="size-2 rounded-full bg-destructive animate-pulse" />
              {error}
            </div>
          )}

          {/* Form */}
          {pageState === "form" && (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label
                  htmlFor="recovery-email"
                  className="block text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1"
                >
                  E-mail institucional ou pessoal
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                    <Mail className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary drop-shadow-[0_0_8px_rgba(116,61,245,0)] group-focus-within:drop-shadow-[0_0_8px_rgba(116,61,245,0.5)] transition-all" />
                  </div>
                  <input
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-bold text-lg hover:bg-white/10"
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary hover:shadow-[0_0_30px_rgba(116,61,245,0.6)] text-white font-black py-4.5 rounded-2xl shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-3 text-lg">
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </span>
              </button>
            </form>
          )}

          {/* Success State */}
          {pageState === "success" && (
            <div className="text-center p-12 bg-white/5 border border-emerald-500/20 rounded-[2.5rem] relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="size-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-8 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle className="h-10 w-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight">
                E-mail enviado!
              </h3>
              <p className="text-muted-foreground mb-10 font-bold text-lg leading-relaxed max-w-xs mx-auto">
                Se o e-mail informado estiver cadastrado, você receberá um link
                para redefinir sua senha em instantes.
              </p>
              <button
                onClick={handleTryAgain}
                className="text-lg font-black text-primary hover:text-primary-hover border-b-2 border-primary/20 hover:border-primary transition-all pb-1 px-2"
              >
                Tentar outro e-mail
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-16 text-center border-t border-white/5 pt-8">
            <p className="text-xs font-black text-muted-foreground tracking-widest uppercase opacity-50">
              © 2026 Tutorfy • Gestão Financeira para Professores
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Security Illustration */}
        <div className="hidden md:flex bg-primary/5 relative items-center justify-center p-20 overflow-hidden">
          <div className="absolute inset-0 bg-[#0c0816] pointer-events-none opacity-40"></div>
          {/* Decorative Blurs */}
          <div className="absolute -top-[10%] -right-[10%] w-[35rem] h-[35rem] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute -bottom-[5%] -left-[5%] w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[100px]" />

          <div className="relative z-10 text-center w-full">
            {/* Security Card */}
            <div className="glass-panel p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 mb-12 max-w-sm mx-auto backdrop-blur-3xl relative group">
              <div className="absolute -top-6 -right-6 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-black tracking-tighter uppercase shadow-lg backdrop-blur-md">
                Secure SSL 256-bit
              </div>
              <div className="flex justify-center mb-10">
                <div className="relative transform group-hover:scale-110 transition-transform duration-500">
                  <div className="absolute inset-0 bg-primary/40 blur-3xl rounded-full scale-150 group-hover:scale-200 transition-all"></div>
                  <Lock className="h-24 w-24 text-primary/10 relative" />
                  <KeyRound className="h-14 w-14 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_15px_rgba(116,61,245,0.8)]" />
                </div>
              </div>
              <h3 className="text-2xl font-black mb-6 text-foreground tracking-tight">
                Privacidade & Segurança
              </h3>
              <p className="text-muted-foreground leading-relaxed font-bold text-lg">
                Utilizamos criptografia de nível militar para garantir que seus
                dados e sua agenda estejam sempre blindados.
              </p>
            </div>

            {/* Security Icons */}
            <div className="flex flex-wrap justify-center gap-8 text-primary/30 p-4 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm max-w-fit mx-auto shadow-inner">
              <div className="group transition-all hover:text-primary hover:scale-120">
                <ShieldCheck className="h-8 w-8 drop-shadow-[0_0_5px_rgba(116,61,245,0)] group-hover:drop-shadow-[0_0_8px_rgba(116,61,245,0.5)]" />
              </div>
              <div className="group transition-all hover:text-primary hover:scale-120">
                <Lock className="h-8 w-8 drop-shadow-[0_0_5px_rgba(116,61,245,0)] group-hover:drop-shadow-[0_0_8px_rgba(116,61,245,0.5)]" />
              </div>
              <div className="group transition-all hover:text-primary hover:scale-120">
                <ShieldCheck className="h-8 w-8 drop-shadow-[0_0_5px_rgba(116,61,245,0)] group-hover:drop-shadow-[0_0_8px_rgba(116,61,245,0.5)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
