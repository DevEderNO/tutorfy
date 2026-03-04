import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CalendarDays,
  Wallet,
  BarChart3,
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

  return (
    <div className="flex min-h-screen overflow-hidden bg-background">
      {/* LEFT SIDE: Hero Section (60%) */}
      <div className="hidden lg:flex w-[60%] relative flex-col justify-center px-20 overflow-hidden border-r border-slate-800/50">
        {/* Abstract Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-indigo-900/30" />

        {/* Decorative Glow */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />

        {/* Branding */}
        <div className="relative z-10 mb-12 flex items-center gap-3">
          <div className="gradient-primary p-2.5 rounded-lg shadow-lg shadow-primary/20">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Tutorfy
          </h1>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-xl">
          <h2 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Gestão de Aulas <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
              Particulares.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg mb-12">
            A plataforma definitiva para tutores que buscam excelência no
            gerenciamento de alunos, horários e finanças.
          </p>

          {/* Feature Cards */}
          <div className="grid gap-4">
            <FeatureCard
              icon={<CalendarDays className="h-5 w-5 text-primary" />}
              iconBg="bg-primary/20"
              borderColor="border-l-primary/60"
              title="Agenda inteligente"
              description="Sincronização em tempo real e lembretes automáticos."
            />
            <FeatureCard
              icon={<Wallet className="h-5 w-5 text-indigo-400" />}
              iconBg="bg-indigo-400/20"
              borderColor="border-l-indigo-400/60"
              title="Controle financeiro"
              description="Fluxo de caixa, pagamentos recorrentes e faturas."
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5 text-slate-200" />}
              iconBg="bg-slate-400/20"
              borderColor="border-l-slate-400/60"
              title="Relatórios detalhados"
              description="Análise de desempenho e crescimento de alunos."
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Section (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center items-center px-8 lg:px-16 bg-slate-950/50 relative">
        {/* Subtle Background Gradient */}
        <div className="absolute inset-0 login-gradient-bg opacity-40" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo (shown only on small screens) */}
          <div className="lg:hidden mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Tutorfy</h1>
            <p className="mt-1 text-muted-foreground">
              Gestão de Aulas Particulares
            </p>
          </div>

          {/* Glassmorphism Form Card */}
          <div className="glass rounded-2xl p-8 lg:p-10 shadow-2xl">
            {/* Top Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-tr from-primary to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-primary/30">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white">
                Bem-vindo de volta
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                Entre com suas credenciais para acessar sua conta
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-300 ml-1"
                >
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/40 transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-300"
                  >
                    Senha
                  </label>
                  <Link
                    to="/recover-password"
                    className="text-xs font-semibold text-primary hover:text-indigo-400 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-3.5 pl-12 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/40 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
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
                className="w-full gradient-primary hover:opacity-90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Entrando..." : "Entrar na Plataforma"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-slate-800" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                  ou
                </span>
                <div className="h-[1px] flex-1 bg-slate-800" />
              </div>

              {/* Google Button */}
              <button
                type="button"
                className="w-full bg-transparent border border-slate-700 hover:bg-slate-800/50 text-slate-200 font-medium py-3.5 rounded-lg flex items-center justify-center gap-3 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Entrar com Google
              </button>
            </form>
          </div>

          {/* Footer Link */}
          <p className="text-center mt-8 text-slate-500 text-sm">
            Ainda não tem uma conta?{" "}
            <a
              href="#"
              className="text-primary font-bold hover:underline"
            >
              Cadastre-se grátis
            </a>
          </p>
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
      className={`glass p-4 rounded-xl flex items-center gap-4 border-l-4 ${borderColor}`}
    >
      <div className={`${iconBg} p-2 rounded-lg`}>{icon}</div>
      <div>
        <h3 className="font-bold text-white">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
