import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  ShieldCheck,
  Settings,
  GraduationCap,
  Pin,
  PinOff,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/auth';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  superAdminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Usuários' },
  { to: '/plans', icon: CreditCard, label: 'Planos', superAdminOnly: true },
  { to: '/financial', icon: DollarSign, label: 'Financeiro', superAdminOnly: true },
  { to: '/admins', icon: ShieldCheck, label: 'Admins', superAdminOnly: true },
  { to: '/settings', icon: Settings, label: 'Configurações', superAdminOnly: true },
];

interface SidebarProps {
  pinned: boolean;
  expanded: boolean;
  onTogglePin: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function Sidebar({ pinned, expanded, onTogglePin, onMouseEnter, onMouseLeave }: SidebarProps) {
  const { isSuperAdmin } = useAdminAuth();
  const visibleItems = navItems.filter((item) => !item.superAdminOnly || isSuperAdmin);

  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`fixed left-0 top-0 z-40 h-screen glass-sidebar flex flex-col overflow-hidden transition-[width] duration-300 ease-in-out ${
        expanded ? 'w-64' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-[72px] border-b border-primary/10">
        <div className="w-16 flex justify-center shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary neon-glow">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <h1 className="text-lg font-bold text-foreground tracking-tight whitespace-nowrap">
            Tutorfy
          </h1>
          <p className="text-[11px] text-primary/70 font-medium whitespace-nowrap">
            Painel Admin
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center py-3 text-sm transition-all rounded-lg ${
                isActive
                  ? 'sidebar-active text-primary font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'
              }`
            }
          >
            <div className="w-16 flex justify-center shrink-0">
              <item.icon className="h-5 w-5" />
            </div>
            <span className="whitespace-nowrap pr-4">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Pin */}
      <div className="border-t border-primary/10">
        <button
          onClick={onTogglePin}
          title={pinned ? 'Recolher sidebar' : 'Fixar sidebar'}
          className="flex items-center w-full py-4 text-slate-500 hover:text-primary transition-colors"
        >
          <div className="w-16 flex justify-center shrink-0">
            {pinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
          </div>
          <span className="whitespace-nowrap text-sm font-medium pr-4">
            {pinned ? 'Recolher' : 'Fixar sidebar'}
          </span>
        </button>
      </div>
    </aside>
  );
}
