import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  DollarSign,
  GraduationCap,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/students", icon: Users, label: "Alunos" },
  { to: "/schedule", icon: CalendarDays, label: "Agenda" },
  { to: "/financial", icon: DollarSign, label: "Financeiro" },
];

export function Sidebar() {
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
    </aside>
  );
}
