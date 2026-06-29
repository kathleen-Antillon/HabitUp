import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export { primaryButtonClass, outlineButtonClass } from "@/lib/brand-colors";

export function AuthButtons({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
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
    <Link href="/" className={cn("flex items-center gap-2 font-bold text-slate-800", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-lg text-white transition-colors hover:bg-slate-900">
        H
      </span>
      <span className="text-xl tracking-tight">HabitUp</span>
    </Link>
  );
}
