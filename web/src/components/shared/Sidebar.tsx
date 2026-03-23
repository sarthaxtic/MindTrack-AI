"use client";

import { Brain, BarChart, History, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import clsx from "clsx";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser } = useAuthStore();

  const handleLogout = () => {
    setUser(null);
    router.push("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      icon: BarChart,
      path: "/dashboard",
    },
    {
      label: "History",
      icon: History,
      path: "/dashboard#history",
    },
  ];

  return (
    <aside className="w-64 bg-slate-800 p-4 hidden md:flex flex-col justify-between">
      <div>
        {/* Logo */}
        <div
          className="flex items-center gap-2 text-indigo-400 mb-6 cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          <Brain />
          <span className="font-bold text-lg">MindTrack</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={clsx(
                  "flex items-center gap-2 w-full p-2 rounded-lg transition",
                  active
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "text-slate-400 hover:bg-slate-700"
                )}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-3">
        <ThemeToggle />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 p-2 rounded-lg w-full"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}