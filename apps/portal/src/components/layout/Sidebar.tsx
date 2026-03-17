import { NavLink } from 'react-router-dom';
import { Home, Users, User, LogOut } from 'lucide-react';
import { usePortalAuth } from '@/lib/auth';
import { Button } from '@tutorfy/ui';

export function Sidebar() {
  const { account, isGuardian, logout } = usePortalAuth();

  const navItems = [
    { to: '/', icon: Home, label: 'Início', end: true },
    ...(isGuardian ? [{ to: '/students', icon: Users, label: 'Alunos vinculados', end: false }] : []),
    { to: '/profile', icon: User, label: 'Meu perfil', end: false },
  ];

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-card border-r border-border min-h-screen">
      <div className="p-5 border-b border-border">
        <p className="text-xs text-muted-foreground">Portal do Aluno</p>
        <p className="font-semibold text-foreground truncate">{account?.name}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {account?.accountType === 'GUARDIAN' ? 'Responsável' : 'Aluno'}
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
