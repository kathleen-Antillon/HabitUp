"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Banknote, Home, Plus, Target } from "lucide-react";
import { useEffect, useState } from "react";
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
      <nav className="pointer-events-none fixed bottom-5 left-0 right-0 z-40 px-5 pb-safe">
        <div className="pointer-events-auto mx-auto flex max-w-lg items-center gap-5">
          <div className="flex flex-1 items-stretch rounded-full border border-slate-200/70 bg-white/90 p-1 shadow-[0_8px_28px_rgba(15,23,42,0.1)] backdrop-blur-xl">
            {tabs.map((tab) => {
              const active = tab.match(pathname);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-2 py-2 text-[11px] font-semibold transition-all duration-200",
                    active
                      ? "bg-emerald-100 text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  <tab.icon className={cn("h-4 w-4", active && "stroke-[2.5]")} />
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {mounted ? (
            <ChallengeActionModal
              trigger={
                <button
                  type="button"
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_8px_24px_rgba(5,150,105,0.35)] ring-4 ring-white/90 transition-transform hover:scale-105 active:scale-95"
                  aria-label="Crear o unirse a un reto"
                >
                  <Plus className="h-6 w-6" strokeWidth={2.5} />
                </button>
              }
            />
          ) : (
            <button
              type="button"
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_8px_24px_rgba(5,150,105,0.35)] ring-4 ring-white/90"
              aria-label="Crear o unirse a un reto"
            >
              <Plus className="h-6 w-6" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </nav>
      <div className="h-28" />
    </>
  );
}
