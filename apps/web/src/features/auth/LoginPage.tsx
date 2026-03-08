import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CalendarDays,
  Wallet,
  BarChart3,
  Loader2,
} from "lucide-react";

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
      await login(email, password);
      navigate("/");
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
    <div className="flex min-h-screen overflow-hidden bg-[#0c0816] font-inter">
      {/* LEFT SIDE: Hero Section (60%) */}
      <div className="hidden lg:flex w-[60%] relative flex-col justify-center px-24 overflow-hidden border-r border-white/5">
        {/* Abstract Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-950/20" />

        {/* Decorative Glows */}
        <div className="absolute -bottom-40 -left-40 w-[45rem] h-[45rem] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-500/10 rounded-full blur-[120px]" />

        {/* Branding */}
        <div className="relative z-10 mb-16 flex items-center gap-4 group cursor-default">
          <div className="size-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-[0_0_25px_rgba(116,61,245,0.4)] group-hover:scale-110 transition-transform duration-500">
            <GraduationCap className="h-8 w-8 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            Tutorfy
          </h1>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-6xl font-black text-white leading-[1.1] mb-10 tracking-tight">
            Gestão de Aulas <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-primary/80 animate-gradient-x">
              Particulares.
            </span>
          </h2>
          <p className="text-muted-foreground text-xl mb-16 font-medium leading-relaxed max-w-lg">
            A plataforma definitiva para tutores que buscam excelência no
            gerenciamento de alunos, horários e finanças.
          </p>

          {/* Feature Cards */}
          <div className="grid gap-6">
            <FeatureCard
              icon={<CalendarDays className="h-6 w-6 text-primary" />}
              iconBg="bg-primary/15"
              borderColor="border-l-primary/60"
              title="Agenda inteligente"
              description="Sincronização em tempo real e lembretes automáticos para nunca perder uma aula."
            />
            <FeatureCard
              icon={<Wallet className="h-6 w-6 text-indigo-400" />}
              iconBg="bg-indigo-400/15"
              borderColor="border-l-indigo-400/60"
              title="Controle financeiro"
              description="Fluxo de caixa, pagamentos recorrentes e emissão de faturas integrada."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-slate-200" />}
              iconBg="bg-white/10"
              borderColor="border-l-white/60"
              title="Relatórios detalhados"
              description="Análise profunda de desempenho, frequência e crescimento do seu negócio."
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Section (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center items-center px-10 lg:px-20 bg-[#151022] relative border-l border-white/5">
        {/* Subtle Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-black/20 pointer-events-none" />

        <div className="w-full max-w-md relative z-10 py-10">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-primary shadow-[0_10px_30px_rgba(116,61,245,0.4)]">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">
              Tutorfy
            </h1>
            <p className="mt-3 text-muted-foreground font-bold uppercase tracking-[0.2em] text-xs">
              Gestão de Aulas Particulares
            </p>
          </div>

          {/* Glassmorphism Form Card */}
          <div className="glass-panel rounded-[2.5rem] p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-white tracking-tight">
                Bem-vindo
              </h2>
              <p className="text-muted-foreground font-semibold text-base mt-3">
                Entre para gerenciar seu império educacional
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-8 rounded-2xl bg-destructive/10 p-5 text-sm font-bold text-destructive border border-destructive/20 flex items-center gap-3 shadow-[0_4px_15px_rgba(239,68,68,0.1)] animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="size-2 rounded-full bg-destructive animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Field */}
              <div className="space-y-3">
                <label
                  htmlFor="email"
                  className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1"
                >
                  Identificação (E-mail)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                    <Mail className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-all duration-300" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 shadow-inner"
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label
                    htmlFor="password"
                    className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Senha de Acesso
                  </label>
                  <Link
                    to="/recover-password"
                    className="text-xs font-black text-primary hover:text-indigo-400 transition-colors uppercase tracking-widest hover:underline"
                  >
                    Recuperar
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                    <Lock className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-all duration-300" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 shadow-inner"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-primary transition-colors"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary hover:shadow-[0_0_30px_rgba(116,61,245,0.6)] text-white font-black py-4.5 rounded-2xl shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-3 text-lg tracking-tight">
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

              {/* Divider */}
              <div className="flex items-center gap-4 py-4">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
                  Ou continue com
                </span>
                <div className="h-[1px] flex-1 bg-white/10" />
              </div>

              {/* Google Button */}
              <div className="flex justify-center w-full group">
                <div className="w-full bg-white rounded-2xl p-[1px] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all">
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

          {/* Footer Link */}
          <div className="text-center mt-12 bg-white/5 border border-white/5 py-4 px-6 rounded-3xl backdrop-blur-sm">
            <p className="text-muted-foreground text-sm font-bold">
              Novo no Tutorfy?{" "}
              <Link
                to="/register"
                className="text-primary font-black hover:text-primary-hover hover:underline transition-all ml-1"
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

/* Feature Card Component */
function FeatureCard({
  icon,
  iconBg,
  borderColor,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className={`glass-panel p-6 rounded-[2rem] flex items-start gap-6 border-l-4 ${borderColor} bg-white/5 border border-white/5 hover:bg-white/10 transition-all hover:scale-[1.02] cursor-default shadow-lg`}
    >
      <div className={`${iconBg} p-3 rounded-2xl shadow-inner`}>{icon}</div>
      <div className="pt-1">
        <h3 className="font-black text-white text-lg tracking-tight mb-1">
          {title}
        </h3>
        <p className="text-muted-foreground font-medium leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
