"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Brain, ChevronDown, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { SIDEBAR_NAV, SETTINGS_SUBMENU } from "@/constants/dashboard";
import { useAuthStore } from "@/store/useAuthStore";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuthStore();

  const [settingsOpen, setSettingsOpen] = useState(
    pathname === "/settings" || pathname.startsWith("/settings/")
  );

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleSettings = () => setSettingsOpen((prev) => !prev);

  // Determine if the Settings link itself is active
  const isSettingsActive = pathname === "/settings";

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 h-full bg-(--surface) border-r border-(--border)">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-(--border)">
        <div className="size-7 rounded-lg bg-(--accent) flex items-center justify-center">
          <Brain size={14} className="text-[#080c10]" />
        </div>
        <span className="font-semibold text-sm text-(--text)">
          MindTrack<span className="text-(--accent)">AI</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {SIDEBAR_NAV.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));

          // Special handling for Settings – it's the parent, not a link (we'll use button to toggle)
          if (label === "Settings") {
            return (
              <div key={label}>
                <button
                  onClick={toggleSettings}
                  className={clsx(
                    "w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-sm",
                    isSettingsActive || settingsOpen
                      ? "bg-(--accent-dim) text-(--accent)"
                      : "text-(--text-secondary) hover:bg-(--surface-raised)"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} />
                    {label}
                  </div>
                  {settingsOpen ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>

                {/* Submenu */}
                {settingsOpen && (
                  <div className="ml-6 mt-1 space-y-0.5 border-l border-(--border) pl-2">
                    {SETTINGS_SUBMENU.map(({ id, label, icon: SubIcon }) => {
                      const isSubActive =
                        pathname === "/settings" && searchParams.get("tab") === id;
                      const href = `/settings?tab=${id}`;
                      return (
                        <Link
                          key={id}
                          href={href}
                          className={clsx(
                            "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm",
                            isSubActive
                              ? "bg-(--accent-dim) text-(--accent)"
                              : "text-(--text-secondary) hover:bg-(--surface-raised)"
                          )}
                        >
                          <SubIcon size={13} />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Other nav items
          return (
            <Link
              key={label}
              href={href}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm",
                isActive
                  ? "bg-(--accent-dim) text-(--accent)"
                  : "text-(--text-secondary) hover:bg-(--surface-raised)"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom – logout + user info (unchanged) */}
      <div className="px-3 pb-4 border-t border-(--border) pt-3 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-(--text-secondary) hover:text-red-400 hover:bg-red-500/5 transition"
        >
          Log out
        </button>
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="size-7 rounded-full bg-(--accent) flex items-center justify-center text-[#080c10] text-[10px] font-bold">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-(--text) truncate">
                {user.email}
              </p>
              <p className="text-[10px] text-(--text-muted)">Free plan</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}