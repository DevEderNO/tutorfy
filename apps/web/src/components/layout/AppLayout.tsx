import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

function loadPinned(): boolean {
  try {
    return localStorage.getItem("sidebar_pinned") !== "false";
  } catch {
    return true;
  }
}

export function AppLayout() {
  const [pinned, setPinned] = useState(loadPinned);
  const [hovered, setHovered] = useState(false);

  const togglePin = () => {
    setPinned((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_pinned", String(next));
      return next;
    });
  };

  const expanded = pinned || hovered;

  return (
    <div className="flex min-h-screen bg-[#0c0816] text-slate-100">
      <Sidebar
        pinned={pinned}
        expanded={expanded}
        onTogglePin={togglePin}
      />
      <div
        className={`flex-1 flex flex-col min-h-screen relative transition-[margin] duration-300 ease-in-out ${
          expanded ? "ml-64" : "ml-16"
        }`}
      >
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
