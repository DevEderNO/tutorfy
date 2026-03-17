import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { usePortalAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { toast } from 'sonner';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = usePortalAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Portal do Aluno</h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe a evolução e histórico</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-4">
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
              placeholder="••••••••"
              required
            />
          </InputField>
          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {token && (
          <p className="text-center text-sm text-muted-foreground">
            Primeira vez?{' '}
            <Link to={`/register?token=${token}`} className="text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
