import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { GoogleSignInButton } from "./components/GoogleSignInButton";
import {
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
  GraduationCap,
} from "lucide-react";
import { AuthHero } from "./components/AuthHero";

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

  const handleGoogleSuccess = async (credential: string) => {
    setError("");
    setLoading(true);
    try {
      await googleLogin(credential);
      navigate("/");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Erro ao conectar com Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0816] font-inter">
      {/* LEFT SIDE: Hero Section */}
      <div className="hidden lg:flex w-full lg:w-[50%] xl:w-[55%]">
        <AuthHero
          title={
            <>
              Junte-se ao <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-primary/80 animate-gradient-x">
                Tutorfy.
              </span>
            </>
          }
          description="A plataforma definitiva para tutores que buscam excelência no gerenciamento de negócio e alunos."
          features={[
            {
              icon: <LayoutDashboard className="h-6 w-6 text-primary" />,
              iconBg: "bg-primary/15",
              borderColor: "border-l-primary/60",
              title: "Gestão Simplificada",
              description: "Controle total de horários e conteúdos.",
            },
            {
              icon: <Receipt className="h-6 w-6 text-indigo-400" />,
              iconBg: "bg-indigo-400/15",
              borderColor: "border-l-indigo-400/60",
              title: "Faturamento Inteligente",
              description: "Cobranças automatizadas e controle financeiro.",
            },
            {
              icon: <Layers className="h-6 w-6 text-slate-200" />,
              iconBg: "bg-white/10",
              borderColor: "border-l-white/60",
              title: "Escalabilidade Real",
              description: "Gerencie centenas de alunos com facilidade.",
            },
          ]}
        />
      </div>

      {/* RIGHT SIDE: Register Section */}
      <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col justify-center items-center px-6 lg:px-12 xl:px-20 bg-[#151022] relative border-l border-white/5 overflow-y-auto custom-scrollbar">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-black/20 pointer-events-none" />

        <div className="w-full max-w-lg relative z-10 py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/40">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              Tutorfy
            </h1>
          </div>

          <div className="glass-panel rounded-[2rem] xl:rounded-[2.5rem] p-8 lg:p-10 xl:p-12 shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4 text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                <CheckCircle2 className="h-3 w-3" /> Inscrição Aberta
              </div>
              <h2 className="text-2xl xl:text-3xl font-black text-white tracking-tight">
                Criar conta
              </h2>
              <p className="text-muted-foreground font-semibold text-sm mt-2">
                Comece sua jornada premium hoje
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-xs font-bold text-destructive border border-destructive/20 flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-destructive animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Nome Completo
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                      <UserIcon className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-inner text-sm"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    E-mail Profissional
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
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-inner text-sm"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Senha de Segurança
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                      <Lock className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-inner text-sm"
                      placeholder="Mínimo 8 caracteres"
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
              </div>

              <div className="flex items-start gap-3 py-1 group cursor-pointer">
                <div className="relative h-5 w-5 mt-0.5 shrink-0">
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
                  className="text-[10px] text-muted-foreground leading-relaxed font-semibold cursor-pointer select-none"
                >
                  Eu li e concordo com os{" "}
                  <a
                    href="#"
                    className="text-primary hover:text-indigo-400 underline"
                  >
                    Termos
                  </a>{" "}
                  e{" "}
                  <a
                    href="#"
                    className="text-primary hover:text-indigo-400 underline"
                  >
                    Políticas
                  </a>
                  .
                </label>
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
                      Criando conta...
                    </>
                  ) : (
                    "Cadastrar Agora"
                  )}
                </span>
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
                  Ou use sua conta
                </span>
                <div className="h-[1px] flex-1 bg-white/10" />
              </div>

              <GoogleSignInButton
                disabled={loading}
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Erro ao conectar com Google")}
              />
            </form>
          </div>

          <div className="text-center mt-6 bg-white/[0.03] border border-white/5 py-4 px-6 rounded-3xl backdrop-blur-sm">
            <p className="text-muted-foreground text-[11px] xl:text-sm font-bold">
              Já faz parte do Tutorfy?{" "}
              <Link
                to="/login"
                className="text-primary font-black hover:text-indigo-400 transition-all ml-1"
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
