import { Search, Bell, Plus, Settings, LogOut, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  title: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
  showCreateButton?: boolean;
  createButtonLink?: string;
  createButtonLabel?: string;
}

export function Header({
  title,
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  actions,
  showCreateButton = false,
  createButtonLink = "/schedule",
  createButtonLabel = "Novo",
}: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 glass border-b border-primary/10 px-8 py-4 flex items-center justify-between backdrop-blur-md">
      <div className="flex items-center gap-8">
        <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>

        {onSearchChange && (
          <div className="relative w-72 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              className="w-full bg-slate-800/50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-200 placeholder:text-slate-500 transition-all outline-none"
              placeholder={searchPlaceholder}
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {actions}

        {showCreateButton && (
          <Link
            to={createButtonLink}
            className="gradient-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">{createButtonLabel}</span>
          </Link>
        )}

        <div className="hidden sm:block h-8 w-[1px] bg-slate-700/50 mx-2"></div>

        <button
          aria-label="Notificações"
          className="glass p-2.5 rounded-xl text-slate-400 hover:text-white relative transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full neon-glow"></span>
        </button>

        {/* User menu */}
        <div className="relative hidden sm:block" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl glass px-2 py-1 border border-primary/20 hover:border-primary/40 transition-colors"
            aria-label="Menu do usuário"
          >
            <div className="flex h-8 w-8 rounded-lg overflow-hidden justify-center items-center bg-primary/10 text-primary font-bold text-sm">
              {user?.avatarUrl ? (
                <img
                  className="w-full h-full object-cover"
                  src={user.avatarUrl}
                  alt="Avatar"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-foreground leading-none">{user?.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-none mt-0.5">
                Premium Plan
              </p>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 glass rounded-xl border border-primary/20 shadow-xl shadow-black/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-primary/10">
                <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="p-1">
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-primary/10 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Configurações
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
