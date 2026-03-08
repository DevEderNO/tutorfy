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
              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Erro ao iniciar com Google")}
                  useOneTap
                  theme="filled_black"
                  shape="rectangular"
                  width="100%"
                />
              </div>
            </form>
          </div>

          {/* Footer Link */}
          <p className="text-center mt-8 text-slate-500 text-sm">
            Ainda não tem uma conta?{" "}
            <a href="#" className="text-primary font-bold hover:underline">
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
