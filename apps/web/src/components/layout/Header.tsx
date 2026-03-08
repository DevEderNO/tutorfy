import { Search, Bell, Plus, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

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
  const { user } = useAuth();

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

        <div className="hidden sm:flex h-10 w-10 rounded-xl glass p-0.5 overflow-hidden border border-primary/20 justify-center items-center bg-primary/10 text-primary font-bold">
          {user?.avatarUrl ? (
            <img
              className="w-full h-full object-cover rounded-lg"
              src={user.avatarUrl}
              alt="Avatar"
            />
          ) : (
            user?.name?.charAt(0).toUpperCase()
          )}
        </div>
      </div>
    </header>
  );
}
