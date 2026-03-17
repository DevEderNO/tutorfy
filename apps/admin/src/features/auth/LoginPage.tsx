import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Shield } from 'lucide-react';
import { useAdminAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';

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
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background login-gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary neon-glow">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Tutorfy Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Portal Administrativo</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium text-muted-foreground">Acesso restrito</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
