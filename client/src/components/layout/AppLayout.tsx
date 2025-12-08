import { Outlet } from "react-router-dom";
import SidebarNav from "./SidebarNav";

export default function AppLayout() {
  return (
    <div className="flex h-screen w-screen bg-slate-900 text-slate-50">
      {/* Sidebar (left) */}
      <aside className="w-64 bg-white border-r shadow-sm">
        <SidebarNav />
      </aside>

      {/* Main content (right) */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

