import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

const ROUTE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: 'Início' },
  '/classes': { title: 'Aulas' },
  '/evolution': { title: 'Evolução' },
  '/materials': { title: 'Materiais' },
  '/students': { title: 'Alunos vinculados', subtitle: 'Acompanhe o progresso de todos os alunos sob sua responsabilidade' },
  '/profile': { title: 'Meu perfil' },
};

function getRouteInfo(pathname: string): { title: string; subtitle?: string } {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith('/students/')) return { title: 'Detalhe do aluno' };
  return { title: 'Portal do Aluno' };
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
  const { title, subtitle } = getRouteInfo(location.pathname);

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
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
