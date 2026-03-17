import { usePortalAuth } from '@/lib/auth';
import { Badge } from '@tutorfy/ui';
import { Button } from '@tutorfy/ui';

export function ProfilePage() {
  const { account, logout } = usePortalAuth();

  if (!account) return null;

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">Suas informações de acesso</p>
      </div>

      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-2xl">
              {account.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-lg text-foreground">{account.name}</p>
            <p className="text-sm text-muted-foreground">{account.email}</p>
            <Badge variant="default" size="sm" className="mt-1">
              {account.accountType === 'GUARDIAN' ? 'Responsável' : 'Aluno'}
            </Badge>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-3">
            Para alterar seus dados de acesso, entre em contato com seu tutor.
          </p>
        </div>
      </div>

      <Button variant="destructive" size="sm" onClick={logout}>
        Sair da conta
      </Button>
    </div>
  );
}
