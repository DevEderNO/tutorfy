import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { usePortalAuth } from '@/lib/auth';
import { Button, Input, InputField, Checkbox } from '@tutorfy/ui';
import { toast } from 'sonner';
import {
  GraduationCap,
  BarChart2,
  CalendarClock,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = usePortalAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err: unknown) {
      const msg =
        err instanceof Object && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg ?? 'Email ou senha inválidos');
    } finally {
      setIsLoading(false);
    }
  };

  const token = searchParams.get('token');

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">

      {/* ── Left Panel: Branding & Stats ── */}
      <div className="relative hidden w-full flex-col items-center justify-center overflow-hidden bg-slate-900 p-12 lg:flex lg:w-1/2">

        {/* Background Glows */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />

        {/* Abstract Shapes */}
        <div className="absolute top-1/4 left-10 h-32 w-32 rotate-12 rounded-2xl border border-primary/20 bg-primary/5 opacity-20" />
        <div className="absolute bottom-1/4 right-10 h-48 w-48 -rotate-12 rounded-full border border-primary/20 bg-primary/5 opacity-20" />

        <div className="relative z-10 flex max-w-lg flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_rgba(60,131,246,0.5)]">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight text-white">Tutorfy</h1>
              <p className="text-xl font-medium text-primary">Portal do Aluno</p>
            </div>
          </div>

          <p className="text-lg leading-relaxed text-slate-400">
            Acompanhe sua evolução, histórico de aulas e muito mais. A plataforma definitiva para acelerar seu aprendizado.
          </p>

          {/* Floating Glass Cards */}
          <div className="mt-8 flex flex-col gap-4">
            <div className="glass-panel flex items-center gap-4 rounded-2xl p-6 transition-transform hover:scale-105">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                <BarChart2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-slate-400">Aulas realizadas</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-white">24</p>
                  <p className="text-xs font-bold text-emerald-400">+12% este mês</p>
                </div>
              </div>
            </div>

            <div className="glass-panel ml-8 flex items-center gap-4 rounded-2xl p-6 transition-transform hover:scale-105">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                <CalendarClock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-slate-400">Próxima aula</p>
                <p className="text-xl font-bold text-white">Amanhã, 10:00</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="absolute bottom-10 left-12">
          <p className="text-sm text-slate-500">© 2025 Tutorfy. Todos os direitos reservados.</p>
        </footer>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex w-full flex-1 items-center justify-center bg-background p-6 lg:w-1/2 lg:p-12">
        <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl lg:p-12">

          <div className="mb-10 flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Bem-vindo de volta</h2>
            <p className="text-muted-foreground">Acesse sua conta para continuar seus estudos.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <InputField label="E-mail">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="seu@email.com"
                leadingIcon={<Mail />}
                size="lg"
                required
              />
            </InputField>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Senha</span>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                leadingIcon={<Lock />}
                trailingIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="pointer-events-auto cursor-pointer hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                }
                size="lg"
                required
              />
            </div>

            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(v) => setRememberMe(v === true)}
              label="Lembrar de mim"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-[0_10px_20px_-5px_rgba(60,131,246,0.4)] active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            {token && (
              <p className="text-center text-sm text-muted-foreground">
                Primeira vez?{' '}
                <Link to={`/register?token=${token}`} className="font-bold text-primary hover:underline">
                  Criar conta
                </Link>
              </p>
            )}
          </form>

          <div className="mt-12 flex items-center gap-4 opacity-50">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Acesso rápido</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Entrar com Google"
              className="h-12 w-12 rounded-full border border-border"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Entrar com Facebook"
              className="h-12 w-12 rounded-full border border-border"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
