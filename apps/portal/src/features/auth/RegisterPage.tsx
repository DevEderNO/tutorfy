import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, Eye, EyeOff, Check, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { usePortalAuth } from '@/lib/auth';
import { Button, Input, InputField } from '@tutorfy/ui';
import { toast } from 'sonner';

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSession } = usePortalAuth();

  const token        = searchParams.get('token') ?? '';
  const accountType  = (searchParams.get('type') ?? 'STUDENT') as 'STUDENT' | 'GUARDIAN';
  const prefillName  = searchParams.get('name') || '';
  const prefillEmail = searchParams.get('email') || '';

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#070d1f]">
        <div className="glass-panel rounded-2xl p-8 text-center max-w-sm w-full space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <Lock className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Link inválido</h2>
            <p className="text-sm text-slate-400">Solicite um novo link ao seu tutor.</p>
          </div>
          <Link to="/login" className="text-primary text-sm hover:underline block font-medium">
            Ir para login
          </Link>
        </div>
      </div>
    );
  }

  if (accountType === 'STUDENT') {
    return <StudentTokenLogin token={token} />;
  }

  return (
    <GuardianRegisterForm
      token={token}
      prefillName={prefillName}
      prefillEmail={prefillEmail}
    />
  );
}

// ─── Login automático para alunos ────────────────────────────────────────────

function StudentTokenLogin({ token }: { token: string }) {
  const navigate = useNavigate();
  const { setSession } = usePortalAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .post<{ data: { token: string; account: { id: string; name: string; email: string | null; accountType: 'STUDENT' | 'GUARDIAN' } } }>(
        '/portal/auth/token-login',
        { token, accountType: 'STUDENT' },
      )
      .then((res) => {
        setSession(res.data.data.token, res.data.data.account);
        navigate('/');
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Object && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        setError(msg ?? 'Erro ao acessar o portal');
      });
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#070d1f]">
        <div className="glass-panel rounded-2xl p-8 text-center max-w-sm w-full space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <Lock className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Erro ao entrar</h2>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
          <Link to="/login" className="text-primary text-sm hover:underline block font-medium">
            Ir para login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#070d1f]">
      <div className="glass-panel rounded-2xl p-8 text-center max-w-sm w-full space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Entrando no portal...</h2>
          <p className="text-sm text-slate-400">Aguarde um momento.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Formulário de cadastro para responsáveis ─────────────────────────────────

function GuardianRegisterForm({
  token,
  prefillName,
  prefillEmail,
}: {
  token: string;
  prefillName: string;
  prefillEmail: string;
}) {
  const navigate = useNavigate();
  const { setSession } = usePortalAuth();

  const [form, setForm] = useState({
    name: prefillName,
    email: prefillEmail,
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post<{ data: { token: string; account: { id: string; name: string; email: string | null; accountType: 'STUDENT' | 'GUARDIAN' } } }>(
        '/portal/auth/register',
        { name: form.name, email: form.email, password: form.password, token, accountType: 'GUARDIAN' },
      );
      setSession(res.data.data.token, res.data.data.account);
      navigate('/');
      toast.success('Conta criada com sucesso!');
    } catch (err: unknown) {
      const msg =
        err instanceof Object && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg ?? 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row overflow-x-hidden">

      {/* ── Lado Esquerdo ─────────────────────────────────────────── */}
      <section className="relative lg:w-[40%] bg-slate-950 flex flex-col justify-between p-10 lg:p-12 overflow-hidden border-r border-primary/10 min-h-[300px] lg:min-h-screen">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary/15 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary neon-glow">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Tutorfy</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
              Acesso do{' '}
              <span className="text-primary">Responsável</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Crie sua conta para acompanhar a evolução do seu filho.
            </p>
          </div>

          <ul className="space-y-5">
            {['Acompanhe as aulas', 'Veja o progresso', 'Acesse materiais do tutor'].map((benefit) => (
              <li key={benefit} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
                </div>
                <span className="font-medium text-slate-200">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <footer className="relative z-10 pt-10">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-medium">
            © 2025 Tutorfy
          </p>
        </footer>
      </section>

      {/* ── Lado Direito ──────────────────────────────────────────── */}
      <main className="relative lg:w-[60%] flex items-center justify-center p-6 lg:p-12 min-h-screen bg-background overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-lg relative z-10">
          <div className="glass-panel rounded-[2rem] p-8 lg:p-12 shadow-2xl">

            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Convite válido</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Criar conta</h2>
              <p className="text-slate-400">Preencha os dados para começar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField label="Nome completo" htmlFor="name">
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Como deseja ser chamado?"
                  leadingIcon={<User />}
                  size="lg"
                  disabled={!!prefillName}
                  required
                />
              </InputField>

              <InputField label="E-mail" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="seuemail@exemplo.com"
                  leadingIcon={<Mail />}
                  size="lg"
                  disabled={!!prefillEmail}
                  required
                />
              </InputField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Senha" htmlFor="password">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    leadingIcon={<Lock />}
                    trailingIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="pointer-events-auto text-slate-400 hover:text-primary transition-colors"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    size="lg"
                    minLength={8}
                    required
                  />
                </InputField>

                <InputField label="Confirmar senha" htmlFor="confirmPassword">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                    leadingIcon={<Lock />}
                    trailingIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="pointer-events-auto text-slate-400 hover:text-primary transition-colors"
                        aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    size="lg"
                    required
                  />
                </InputField>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar minha conta'}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Já tem conta?{' '}
              <Link to={`/login?token=${token}`} className="text-primary font-bold hover:text-primary/80 transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
