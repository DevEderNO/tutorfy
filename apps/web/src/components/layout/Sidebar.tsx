import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  DollarSign,
  LogOut,
  GraduationCap,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/students", icon: Users, label: "Alunos" },
  { to: "/schedule", icon: CalendarDays, label: "Agenda" },
  { to: "/financial", icon: DollarSign, label: "Financeiro" },
  { to: "/settings", icon: Settings, label: "Configurações" },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 glass-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary neon-glow">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Tutorfy
          </h1>
          <p className="text-xs text-primary/70 font-medium">Gestão de Aulas</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                isActive
                  ? "sidebar-active text-primary font-semibold"
                  : "text-slate-400 hover:text-white font-medium"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="mt-auto border-t border-primary/10 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-primary/20 font-bold text-primary">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user?.name || "User"}
                className="h-full w-full object-cover"
              />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-bold text-foreground">
              {user?.name}
            </p>
            <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Premium Plan
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-red-400"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
