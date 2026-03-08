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
  CheckCircle2,
  Loader2,
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
            Junte-se ao <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-primary/80 animate-gradient-x">
              Tutorfy.
            </span>
          </h2>
          <p className="text-muted-foreground text-xl mb-16 font-medium leading-relaxed max-w-lg">
            A plataforma definitiva para tutores que buscam excelência no
            gerenciamento de negócio e alunos.
          </p>

          {/* Feature Cards */}
          <div className="grid gap-6">
            <FeatureCard
              icon={<LayoutDashboard className="h-6 w-6 text-primary" />}
              iconBg="bg-primary/15"
              borderColor="border-l-primary/60"
              title="Gestão Simplificada"
              description="Controle total de horários, alunos e conteúdos em um painel intuitivo e poderoso."
            />
            <FeatureCard
              icon={<Receipt className="h-6 w-6 text-indigo-400" />}
              iconBg="bg-indigo-400/15"
              borderColor="border-l-indigo-400/60"
              title="Faturamento Inteligente"
              description="Cobranças automatizadas, controle de inadimplência e diversos métodos de pagamento."
            />
            <FeatureCard
              icon={<Layers className="h-6 w-6 text-slate-200" />}
              iconBg="bg-white/10"
              borderColor="border-l-white/60"
              title="Escalabilidade Real"
              description="Gerencie centenas de alunos ou múltiplos professores com a mesma facilidade."
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Register Section (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center items-center px-10 lg:px-20 bg-[#151022] relative border-l border-white/5 overflow-y-auto custom-scrollbar">
        {/* Subtle Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-black/20 pointer-events-none" />

        <div className="w-full max-w-md relative z-10 py-12 my-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-primary shadow-[0_10px_30px_rgba(116,61,245,0.4)]">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">
              Tutorfy
            </h1>
          </div>

          {/* Glassmorphism Form Card */}
          <div className="glass-panel rounded-[2.5rem] p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6 text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                <CheckCircle2 className="h-3 w-3" /> Inscrição Aberta
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Criar conta
              </h2>
              <p className="text-muted-foreground font-semibold text-base mt-2">
                Comece sua jornada premium hoje
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-8 rounded-2xl bg-destructive/10 p-5 text-sm font-bold text-destructive border border-destructive/20 flex items-center gap-3 shadow-[0_4px_15px_rgba(239,68,68,0.1)] animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="size-2 rounded-full bg-destructive animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                  Nome Completo
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                    <UserIcon className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-all duration-300" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 shadow-inner"
                    placeholder="Seu nome"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                  E-mail Profissional
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                    <Mail className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-all duration-300" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 shadow-inner"
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                  Senha de Segurança
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                    <Lock className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-all duration-300" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 shadow-inner"
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
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

              {/* Terms */}
              <div className="flex items-start gap-3 py-2 group cursor-pointer">
                <div className="relative h-5 w-5 mt-0.5">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="peer appearance-none h-5 w-5 rounded-lg border border-white/10 bg-white/5 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                  />
                  <CheckCircle2 className="absolute top-0.5 left-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <label
                  htmlFor="terms"
                  className="text-xs text-muted-foreground leading-relaxed font-semibold cursor-pointer select-none"
                >
                  Eu li e concordo com os{" "}
                  <a
                    href="#"
                    className="text-primary hover:text-indigo-400 underline transition-colors"
                  >
                    Termos de Uso
                  </a>{" "}
                  e{" "}
                  <a
                    href="#"
                    className="text-primary hover:text-indigo-400 underline transition-colors"
                  >
                    Políticas
                  </a>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary hover:shadow-[0_0_30px_rgba(116,61,245,0.6)] text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-3 text-lg tracking-tight">
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Cadastrar Agora"
                  )}
                </span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-3">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
                  Ou use sua conta
                </span>
                <div className="h-[1px] flex-1 bg-white/10" />
              </div>

              {/* Google Button */}
              <div className="flex justify-center w-full group">
                <div className="w-full bg-white rounded-2xl p-[1px] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all overflow-hidden">
                  <div className="w-full overflow-hidden rounded-[0.9rem]">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError("Erro ao conectar com Google")}
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
              Já faz parte do Tutorfy?{" "}
              <Link
                to="/login"
                className="text-primary font-black hover:text-primary-hover hover:underline transition-all ml-1"
              >
                Faça login
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
      className={`glass-panel p-6 rounded-[2rem] flex items-start gap-6 border-l-4 ${borderColor} bg-white/5 border border-white/5 hover:bg-white/10 transition-all hover:scale-[1.02] cursor-default shadow-lg group`}
    >
      <div
        className={`${iconBg} p-3 rounded-2xl shadow-inner group-hover:bg-primary/20 transition-colors duration-500`}
      >
        {icon}
      </div>
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
