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
  User as UserIcon,
  LayoutDashboard,
  Receipt,
  Layers,
} from "lucide-react";

export function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
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
      await register(name, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

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
            Junte-se ao <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
              Tutorfy.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg mb-12">
            A plataforma definitiva para tutores que buscam excelência no
            gerenciamento de negócio e alunos.
          </p>

          {/* Feature Cards */}
          <div className="grid gap-4">
            <FeatureCard
              icon={<LayoutDashboard className="h-5 w-5 text-primary" />}
              iconBg="bg-primary/20"
              borderColor="border-l-primary/60"
              title="Gestão Simplificada"
              description="Controle total de horários e alunos em um só lugar."
            />
            <FeatureCard
              icon={<Receipt className="h-5 w-5 text-indigo-400" />}
              iconBg="bg-indigo-400/20"
              borderColor="border-l-indigo-400/60"
              title="Dual Billing Automático"
              description="Faturamento automatizado e transparente para todos."
            />
            <FeatureCard
              icon={<Layers className="h-5 w-5 text-slate-200" />}
              iconBg="bg-slate-400/20"
              borderColor="border-l-slate-400/60"
              title="Multi-tenant Nativo"
              description="Gerencie múltiplas unidades ou equipes de tutores."
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Register Section (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center items-center px-8 lg:px-16 bg-slate-950/50 relative overflow-y-auto max-h-screen py-8">
        {/* Subtle Background Gradient */}
        <div className="absolute inset-0 login-gradient-bg opacity-40" />

        <div className="w-full max-w-md relative z-10 my-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Tutorfy</h1>
          </div>

          {/* Glassmorphism Form Card */}
          <div className="glass rounded-2xl p-8 lg:p-10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 p-4 rounded-full">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white">Criar sua conta</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Comece sua jornada premium hoje.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                  Nome Completo
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="text-slate-500 h-5 w-5 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-3 pl-10 pr-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-slate-500 h-5 w-5 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-3 pl-10 pr-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                  Senha
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-slate-500 h-5 w-5 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-3 pl-10 pr-10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 py-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-slate-400 leading-normal"
                >
                  Eu concordo com os{" "}
                  <a href="#" className="text-primary hover:underline">
                    Termos de Serviço
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-primary hover:underline">
                    Política de Privacidade
                  </a>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary hover:opacity-90 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
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
                  onError={() => setError("Erro ao conectar com Google")}
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
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline"
            >
              Faça login
            </Link>
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
