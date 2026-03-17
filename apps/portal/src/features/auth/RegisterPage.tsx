import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { usePortalAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { toast } from 'sonner';

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSession } = usePortalAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get('token') ?? '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Link de convite inválido ou expirado');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post<{ data: { token: string; account: { id: string; name: string; email: string; accountType: 'STUDENT' | 'GUARDIAN' } } }>('/portal/auth/register', { ...form, token });
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

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-xl p-6 text-center max-w-sm w-full space-y-3">
          <p className="text-destructive font-medium">Link de convite inválido</p>
          <p className="text-sm text-muted-foreground">Solicite um novo link ao seu tutor.</p>
          <Link to="/login" className="text-primary text-sm hover:underline block">
            Ir para login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Portal do Aluno — Tutorfy</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-4">
          <InputField label="Nome completo">
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Seu nome"
              required
            />
          </InputField>
          <InputField label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="seu@email.com"
              required
            />
          </InputField>
          <InputField label="Senha">
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
            />
          </InputField>
          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link to={`/login?token=${token}`} className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
