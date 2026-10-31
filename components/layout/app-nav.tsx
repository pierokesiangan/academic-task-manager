"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calendar,
  Lock,
  Moon,
  Sun,
  Sparkles,
  Settings,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { NotificationBell } from "@/components/notifications/notification-bell";

export function AppNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Jangan tampilkan navigasi di halaman /unlock
  if (pathname === "/unlock") return null;

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "Tugas", icon: CheckSquare },
    { href: "/courses", label: "Mata Kuliah", icon: BookOpen },
    { href: "/calendar", label: "Kalender", icon: Calendar },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Top Navbar for Desktop & Tablet */}
      <header className="sticky top-0 z-40 w-full border-b border-surface-border/80 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-navy-900 border border-cobalt-500/30 flex items-center justify-center shadow-inner relative group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-butter-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground leading-none">
                Ice & Butter
              </span>
              <span className="text-[10px] text-cobalt-400 font-medium">Academic Hub</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                    isActive
                      ? "bg-surface border border-surface-border text-foreground font-semibold shadow-sm"
                      : "text-muted hover:text-foreground hover:bg-surface/50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-butter-300" : "text-muted"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Utilities: Notification, Theme Toggle & Lock */}
          <div className="flex items-center gap-2">
            <NotificationBell />

            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border flex items-center justify-center text-muted hover:text-foreground transition-all"
              title="Ganti Tema (Dark / Light)"
              aria-label="Ganti Tema"
            >
              <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-cobalt-300" />
            </button>

            <form action={logoutAction}>
              <button
                type="submit"
                className="h-8 px-2.5 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-xs text-muted hover:text-foreground flex items-center gap-1.5 transition-all"
                title="Kunci Aplikasi"
              >
                <Lock className="w-3.5 h-3.5 text-butter-300" />
                <span className="hidden sm:inline">Kunci</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb Friendly) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-surface-border px-3 py-1.5 flex items-center justify-around shadow-2xl">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                isActive ? "text-butter-300 font-semibold" : "text-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
