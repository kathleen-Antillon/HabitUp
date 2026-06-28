import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AuthButtons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <Button variant="outline" asChild>
        <Link href="/login">Iniciar sesión</Link>
      </Button>
      <Button asChild>
        <Link href="/register">Crear cuenta</Link>
      </Button>
    </div>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-bold text-emerald-700 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg text-white">
        H
      </span>
      <span className="text-xl tracking-tight">HabitUp</span>
    </Link>
  );
}
