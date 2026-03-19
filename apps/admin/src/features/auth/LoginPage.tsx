import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Shield, Users, TrendingUp } from 'lucide-react';
import { useAdminAuth } from '@/lib/auth';
import { Button, Input, InputField } from '@tutorfy/ui';

const FEATURES = [
  { icon: Shield,      label: 'Segurança Avançada',       desc: 'Autenticação robusta e controle de acesso por perfil' },
  { icon: Users,       label: 'Gestão Multi-tenant',      desc: 'Gerencie todos os tutores da plataforma em um só lugar' },
  { icon: TrendingUp,  label: 'Relatórios em Tempo Real', desc: 'Métricas financeiras e de uso atualizadas ao vivo' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      setError(
        err instanceof Object && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro ao fazer login'
          : 'Erro ao fazer login',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Painel decorativo (desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden">
        {/* orbs de fundo */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 h-64 w-64 rounded-full bg-chart-2/15 blur-3xl" />
          <div className="absolute top-2/3 left-1/2 h-48 w-48 rounded-full bg-chart-3/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-10">
          {/* logo */}
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary neon-glow">
            <GraduationCap className="h-12 w-12 text-primary-foreground" />
          </div>

          {/* brand */}
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Tutorfy Admin</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xs">
              Gerencie sua plataforma com total controle e visibilidade
            </p>
          </div>

          {/* feature bullets */}
          <div className="flex flex-col gap-5 text-left w-full max-w-xs">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Painel do formulário ── */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-16 relative">
        {/* orb mobile */}
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-chart-2/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          {/* logo mobile */}
          <div className="flex flex-col items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary neon-glow">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Tutorfy Admin</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Portal Administrativo</p>
            </div>
          </div>

          {/* card */}
          <div className="glass rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Bem-vindo de volta</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs text-muted-foreground">Acesso restrito a administradores</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField label="Email">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tutorfy.com"
                  required
                  autoComplete="email"
                />
              </InputField>

              <InputField label="Senha">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </InputField>

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                  <Shield className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full neon-glow mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} Tutorfy · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
