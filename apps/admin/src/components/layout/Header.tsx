import { LogOut, Shield } from 'lucide-react';
import { useAdminAuth } from '@/lib/auth';
import { Badge, Button } from '@tutorfy/ui';

interface HeaderProps {
  sidebarExpanded: boolean;
}

export function Header({ sidebarExpanded }: HeaderProps) {
  const { admin, logout, isSuperAdmin } = useAdminAuth();

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-[72px] glass border-b border-white/5 flex items-center justify-between px-6 transition-[left] duration-300 ${
        sidebarExpanded ? 'left-64' : 'left-16'
      }`}
    >
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary" />
        <span className="text-sm text-muted-foreground">Portal Administrativo</span>
      </div>

      <div className="flex items-center gap-4">
        {admin && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{admin.name}</p>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
            </div>
            <Badge variant={isSuperAdmin ? 'primary' : 'default'} size="sm">
              {isSuperAdmin ? 'Super Admin' : 'Suporte'}
            </Badge>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          title="Sair"
          className="text-slate-400 hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
