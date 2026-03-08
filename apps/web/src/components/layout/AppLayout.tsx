import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#0c0816] text-slate-100">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
