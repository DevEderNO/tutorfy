import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Início',
  '/classes': 'Aulas',
  '/evolution': 'Evolução',
  '/materials': 'Materiais',
  '/students': 'Alunos vinculados',
  '/profile': 'Meu perfil',
};

function getTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith('/students/')) return 'Detalhe do aluno';
  return 'Portal do Aluno';
}

function loadPinned(): boolean {
  try {
    return localStorage.getItem('portal_sidebar_pinned') !== 'false';
  } catch {
    return true;
  }
}

export function AppLayout() {
  const [pinned, setPinned] = useState(loadPinned);
  const location = useLocation();

  const togglePin = () => {
    setPinned((prev) => {
      const next = !prev;
      localStorage.setItem('portal_sidebar_pinned', String(next));
      return next;
    });
  };

  const expanded = pinned;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        pinned={pinned}
        expanded={expanded}
        onTogglePin={togglePin}
      />
      <div
        className={`flex-1 flex flex-col min-h-screen transition-[margin] duration-300 ease-in-out ${
          expanded ? 'ml-64' : 'ml-16'
        }`}
      >
        <Header title={getTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
