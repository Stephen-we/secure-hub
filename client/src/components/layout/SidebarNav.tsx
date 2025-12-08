// src/components/layout/SidebarNav.tsx
import { Home, Folder, MessageSquare, Users, FileClock, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  // 🔁 CHANGE path from "/dashboard" to "/"
  { name: "Dashboard", icon: Home, path: "/" },
  { name: "Files", icon: Folder, path: "/files" },
  { name: "Chat", icon: MessageSquare, path: "/chat" },
  { name: "Users", icon: Users, path: "/users" },
  { name: "Download Logs", icon: FileClock, path: "/logs" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export default function SidebarNav() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("securehub_token");
    localStorage.removeItem("securehub_user");
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col h-full p-4 bg-slate-950 border-r border-slate-800">
      <h2 className="text-xl font-bold mb-6 text-slate-50">SecureHub</h2>

      {/* Navigation Links */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 text-slate-200"
              >
                <Icon size={18} />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <Button
        variant="destructive"
        className="w-full mt-4"
        onClick={handleLogout}
      >
        <LogOut size={18} className="mr-2" /> Logout
      </Button>
    </div>
  );
}
