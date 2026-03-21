import { Bell, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortalAuth } from '@/lib/auth';
import { useSelectedStudent } from '@/lib/selected-student';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { account, logout } = usePortalAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const { students, selectedStudent, setSelectedId } = useSelectedStudent();
  const showPicker = account?.accountType === 'GUARDIAN' && students.length > 1;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 glass border-b border-primary/10 px-8 py-4 flex items-center justify-between backdrop-blur-md">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">

        {/* Seletor de aluno */}
        {showPicker && (
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="flex items-center gap-2.5 glass rounded-xl px-3 py-2 border border-primary/20 hover:border-primary/40 transition-colors"
              aria-label="Selecionar aluno"
            >
              <div className="h-6 w-6 rounded-full bg-slate-800 border border-primary/30 overflow-hidden flex items-center justify-center shrink-0 text-[11px] font-bold text-primary">
                {selectedStudent?.avatarUrl ? (
                  <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} className="h-full w-full object-cover" />
                ) : (
                  selectedStudent?.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-sm font-semibold text-white hidden sm:block max-w-[120px] truncate">
                {selectedStudent?.name}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${pickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {pickerOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 glass rounded-xl border border-primary/20 shadow-xl shadow-black/40 overflow-hidden z-50">
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-primary/10">
                  Visualizando
                </p>
                <div className="p-1">
                  {students.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedId(s.id); setPickerOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                        s.id === selectedStudent?.id ? 'bg-primary/20 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="h-8 w-8 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                        {s.avatarUrl ? (
                          <img src={s.avatarUrl} alt={s.name} className="h-full w-full object-cover" />
                        ) : (
                          s.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{s.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{s.grade || s.school || '—'}</p>
                      </div>
                      {s.id === selectedStudent?.id && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="hidden sm:block h-8 w-[1px] bg-slate-700/50" />

        <button
          aria-label="Notificações"
          className="glass p-2.5 rounded-xl text-slate-400 hover:text-white relative transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full neon-glow" />
        </button>

        {/* User menu */}
        <div className="relative hidden sm:block" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl glass px-2 py-1 border border-primary/20 hover:border-primary/40 transition-colors"
            aria-label="Menu do usuário"
          >
            <div className="flex h-8 w-8 rounded-lg overflow-hidden justify-center items-center bg-primary/10 text-primary font-bold text-sm">
              {account?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-foreground leading-none">{account?.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-none mt-0.5">
                {account?.accountType === 'GUARDIAN' ? 'Responsável' : 'Aluno'}
              </p>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 glass rounded-xl border border-primary/20 shadow-xl shadow-black/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-primary/10">
                <p className="text-sm font-bold text-foreground truncate">{account?.name}</p>
                <p className="text-xs text-slate-500 truncate">{account?.email}</p>
              </div>
              <div className="p-1">
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-primary/10 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Meu perfil
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
