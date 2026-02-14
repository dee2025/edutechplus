"use client";

import {
  BarChart3,
  Bell,
  Eye,
  FileText,
  Folder,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageCircle,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Organized menu structure with sections
const menuSections = [
  {
    label: "Main",
    items: [
      { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Articles", path: "/admin/articles", icon: FileText },
      { name: "Categories", path: "/admin/categories", icon: Folder },
      { name: "Homepage", path: "/admin/homepage", icon: Home },
    ],
  },
  {
    label: "Community",
    items: [
      { name: "Users", path: "/admin/users", icon: Users },
      { name: "Comments", path: "/admin/comments", icon: MessageCircle },
      { name: "Subscribers", path: "/admin/subscribers", icon: Mail },
    ],
  },
  {
    label: "Communications",
    items: [{ name: "Newsletter", path: "/admin/newsletter", icon: Bell }],
  },
  {
    label: "Analytics",
    items: [
      { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
      { name: "Live Monitor", path: "/admin/views-monitor", icon: Eye },
    ],
  },
];

const bottomMenu = [
  { name: "Settings", path: "#", icon: Settings },
  { name: "Logout", path: "#", icon: LogOut },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => pathname.startsWith(path);

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-gradient-to-b from-[#0f1419] via-[#111827] to-[#0b0f19] border-r border-gray-700/50 hidden md:flex flex-col h-screen transition-all duration-300 backdrop-blur-sm`}
    >
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-700/50 flex items-center justify-between">
        <div
          className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center font-bold text-white shadow-lg">
            E+
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold">EduTech+</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {menuSections.map((section) => (
          <div key={section.label} className="space-y-2">
            {/* Section Label */}
            {!collapsed && (
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.label}
                </p>
              </div>
            )}

            {/* Section Items */}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                    active
                      ? "bg-gradient-to-r from-cyan-500/25 to-cyan-600/15 text-cyan-300 shadow-lg shadow-cyan-500/10"
                      : "text-gray-400 hover:bg-gray-800/40 hover:text-gray-200"
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    size={18}
                    className={`flex-shrink-0 ${
                      active ? "text-cyan-400" : "group-hover:text-cyan-300"
                    }`}
                  />
                  {!collapsed && <span>{item.name}</span>}

                  {active && !collapsed && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/50" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-gray-700/50 space-y-2">
        {bottomMenu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.path}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 transition-all duration-200"
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-gray-700/50 text-xs text-gray-500 bg-gray-900/30">
          <p>Admin Panel v2</p>
          <p>© 2026 EduTech+</p>
        </div>
      )}
    </aside>
  );
}
