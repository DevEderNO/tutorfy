import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AdminLayout() {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const expanded = pinned || hovered;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        pinned={pinned}
        expanded={expanded}
        onTogglePin={() => setPinned((p) => !p)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <Header sidebarExpanded={expanded} />
      <main
        className={`pt-[72px] min-h-screen transition-[padding-left] duration-300 ${
          expanded ? 'pl-64' : 'pl-16'
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
