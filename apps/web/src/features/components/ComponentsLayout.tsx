import { NavLink, Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";

const tabs = [
  { to: "/components/atoms", label: "Átomos" },
  { to: "/components/molecules", label: "Moléculas" },
  { to: "/components/organisms", label: "Organismos" },
];

export function ComponentsLayout() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Components" />

      <div className="px-6 pt-4 pb-0 border-b border-white/5">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-semibold rounded-t-lg transition-all duration-200 ${
                  isActive
                    ? "text-white border-b-2 border-primary"
                    : "text-slate-500 hover:text-slate-300"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}
