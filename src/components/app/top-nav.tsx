"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function shouldShowTopNav(pathname: string): boolean {
  return (
    pathname.startsWith("/app/home") ||
    pathname.startsWith("/app/challenges") ||
    pathname.startsWith("/app/penitencias") ||
    pathname.startsWith("/app/profile") ||
    pathname.startsWith("/app/notifications")
  );
}

export function TopNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function updateNav() {
      const currentY = window.scrollY;

      if (currentY <= 8) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 4) {
        setVisible(false);
      } else if (currentY < lastScrollY.current - 4) {
        setVisible(true);
      }

      lastScrollY.current = currentY;
      ticking.current = false;
    }

    function onScroll() {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(updateNav);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!shouldShowTopNav(pathname)) return null;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 h-14 border-b border-slate-200 bg-white/95 pt-safe backdrop-blur supports-[backdrop-filter]:bg-white/80 transition-transform duration-300 ease-in-out",
        visible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="mx-auto flex h-full w-full min-w-0 max-w-lg items-center justify-between px-4">
        <Link
          href="/app/home"
          className="flex items-center gap-2 font-bold text-emerald-700"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-sm text-white">
            H
          </span>
          <span className="text-base tracking-tight sm:text-lg">HabitUp</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/app/notifications"
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              pathname.startsWith("/app/notifications")
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
            )}
            aria-label="Notificaciones"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
            )}
          </Link>

          <Link
            href="/app/profile"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              pathname.startsWith("/app/profile")
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
            )}
            aria-label="Ir a perfil"
          >
            <User className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
