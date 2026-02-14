"use client";

import { Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="h-16 bg-gradient-to-r from-gray-900/80 to-gray-800/60 border-b border-gray-700/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm font-medium text-gray-300">System Online</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-400 hover:text-gray-200 transition-colors hover:bg-gray-700/30 rounded-lg">
          <Bell size={20} />
          <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full" />
        </button>

        <div className="w-px h-6 bg-gray-700/50" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-gray-300">Admin</p>
            <p className="text-xs text-gray-500">Management Panel</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-medium transition-all text-sm border border-red-500/20"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
