import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CalendarDays,
  Wallet,
  BarChart3,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { AuthHero } from "./components/AuthHero";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.id) {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const { googleLogin } = useAuth();

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    if (!credentialResponse.credential) return;
    setError("");
    setLoading(true);

    try {
      await googleLogin(credentialResponse.credential);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao conectar com Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0816] font-inter">
      {/* LEFT SIDE: Hero Section */}
      <div className="hidden lg:flex w-full lg:w-[55%] xl:w-[60%]">
        <AuthHero
          title={
            <>
              Gestão de Aulas <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-primary/80 animate-gradient-x">
                Particulares.
              </span>
            </>
          }
          description="A plataforma definitiva para tutores que buscam excelência no gerenciamento de alunos, horários e finanças."
          features={[
            {
              icon: <CalendarDays className="h-6 w-6 text-primary" />,
              iconBg: "bg-primary/15",
              borderColor: "border-l-primary/60",
              title: "Agenda inteligente",
              description:
                "Sincronização em tempo real e lembretes automáticos.",
            },
            {
              icon: <Wallet className="h-6 w-6 text-indigo-400" />,
              iconBg: "bg-indigo-400/15",
              borderColor: "border-l-indigo-400/60",
              title: "Controle financeiro",
              description: "Fluxo de caixa e emissão de faturas integrada.",
            },
            {
              icon: <BarChart3 className="h-6 w-6 text-slate-200" />,
              iconBg: "bg-white/10",
              borderColor: "border-l-white/60",
              title: "Relatórios detalhados",
              description: "Análise profunda de desempenho do seu negócio.",
            },
          ]}
        />
      </div>

      {/* RIGHT SIDE: Login Section */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center items-center px-6 lg:px-12 xl:px-20 bg-[#151022] relative border-l border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-black/20 pointer-events-none" />

        <div className="w-full max-w-md relative z-10 py-6">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/40">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              Tutorfy
            </h1>
          </div>

          <div className="glass-panel rounded-[2rem] xl:rounded-[2.5rem] p-8 lg:p-10 xl:p-12 shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="text-center mb-8 xl:mb-10">
              <h2 className="text-2xl xl:text-3xl font-black text-white tracking-tight">
                Bem-vindo
              </h2>
              <p className="text-muted-foreground font-semibold text-sm xl:text-base mt-2">
                Entre para gerenciar seu império educacional
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-xs font-bold text-destructive border border-destructive/20 flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-destructive animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 xl:space-y-7">
              <div className="space-y-2">
                <label className="text-[10px] xl:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                  Identificação (E-mail)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                    <Mail className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 xl:py-4 pl-12 pr-4 text-white font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-inner text-sm xl:text-base"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] xl:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Senha de Acesso
                  </label>
                  <Link
                    to="/recover-password"
                    className="text-[10px] xl:text-xs font-black text-primary hover:text-indigo-400 transition-colors uppercase tracking-widest hover:underline"
                  >
                    Recuperar
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                    <Lock className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 xl:py-4 pl-12 pr-12 text-white font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-inner text-sm xl:text-base"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-primary transition-colors"
                  >
                    {showPassword ? (
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
                className="w-full gradient-primary hover:shadow-[0_0_30px_rgba(116,61,245,0.4)] text-white font-black py-4 rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 group relative overflow-hidden"
              >
                <span className="relative flex items-center justify-center gap-3 text-base xl:text-lg tracking-tight">
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Autenticando...
                    </>
                  ) : (
                    "Acessar Plataforma"
                  )}
                </span>
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-[9px] xl:text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
                  Ou continue com
                </span>
                <div className="h-[1px] flex-1 bg-white/10" />
              </div>

              <div className="flex justify-center w-full group">
                <div className="w-full bg-white rounded-2xl p-[1px] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all">
                  <div className="w-full overflow-hidden rounded-2xl">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError("Erro ao iniciar com Google")}
                      useOneTap
                      theme="filled_black"
                      shape="rectangular"
                      width="100%"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="text-center mt-8 xl:mt-10 bg-white/[0.03] border border-white/5 py-4 px-6 rounded-3xl backdrop-blur-sm">
            <p className="text-muted-foreground text-xs xl:text-sm font-bold">
              Novo no Tutorfy?{" "}
              <Link
                to="/register"
                className="text-primary font-black hover:text-indigo-400 transition-all ml-1"
              >
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
