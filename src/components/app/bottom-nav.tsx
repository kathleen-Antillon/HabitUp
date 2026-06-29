"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Banknote, Home, Plus, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { fabButtonClass, navActiveClass } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";

const ChallengeActionModal = dynamic(
  () => import("./challenge-action-modal").then((m) => m.ChallengeActionModal),
  { ssr: false }
);

const tabs = [
  { href: "/app/home", label: "Home", icon: Home, match: (path: string) => path.startsWith("/app/home") },
  {
    href: "/app/challenges",
    label: "Retos",
    icon: Target,
    match: (path: string) => path.startsWith("/app/challenges"),
  },
  {
    href: "/app/penitencias",
    label: "Penitencias",
    icon: Banknote,
    match: (path: string) => path.startsWith("/app/penitencias"),
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <nav className="pointer-events-none fixed bottom-3 left-0 right-0 z-40 px-3 pb-safe sm:bottom-5 sm:px-5">
        <div className="pointer-events-auto mx-auto flex w-full min-w-0 max-w-lg items-center gap-2 sm:gap-5">
          <div className="flex min-w-0 flex-1 items-stretch rounded-full border border-slate-200/70 bg-white/90 p-1 shadow-[0_8px_28px_rgba(15,23,42,0.1)] backdrop-blur-xl">
            {tabs.map((tab) => {
              const active = tab.match(pathname);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-2 text-[10px] font-semibold transition-all duration-200 min-[380px]:px-2 min-[380px]:text-[11px]",
                    active
                      ? navActiveClass
                      : "text-slate-500 hover:bg-[#F8FAFC] hover:text-[#334155]"
                  )}
                >
                  <tab.icon className={cn("h-4 w-4 shrink-0", active && "stroke-[2.5]")} />
                  <span className="truncate">{tab.label}</span>
                </Link>
              );
            })}
          </div>

          {mounted ? (
            <ChallengeActionModal
              trigger={
                <button
                  type="button"
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-4 ring-white/90 transition-all duration-200 ease-out sm:h-[52px] sm:w-[52px]",
                    fabButtonClass
                  )}
                  aria-label="Crear o unirse a un reto"
                >
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                </button>
              }
            />
          ) : (
            <button
              type="button"
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-4 ring-white/90 transition-all duration-200 ease-out sm:h-[52px] sm:w-[52px]",
                fabButtonClass
              )}
              aria-label="Crear o unirse a un reto"
            >
              <Plus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </nav>
      <div className="h-24 pb-safe sm:h-28" />
    </>
  );
}
