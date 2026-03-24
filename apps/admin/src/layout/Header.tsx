import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/lib/auth';
import { usePageHeaderState } from '@/lib/page-header';
import { Badge, Button } from '@tutorfy/ui';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  sidebarExpanded: boolean;
}

export function Header({ sidebarExpanded }: HeaderProps) {
  const { admin, logout, isSuperAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const { title, subtitle, backTo } = usePageHeaderState();

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-[72px] glass border-b border-white/5 flex items-center justify-between px-6 transition-[left] duration-300 ${
        sidebarExpanded ? 'left-64' : 'left-16'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {backTo && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(backTo)}
            aria-label="Voltar"
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        {title ? (
          <div className="min-w-0">
            <p className="text-base font-bold text-foreground leading-tight truncate">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground leading-tight truncate">{subtitle}</p>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-4 shrink-0">
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
