"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { clearAbandonedChallengesAction } from "@/actions/challenges";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ClearAbandonedChallengesButton({ count }: { count: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClear() {
    setLoading(true);
    setError("");

    const result = await clearAbandonedChallengesAction();

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
        Limpiar
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Limpiar retos no continuados?</DialogTitle>
            <DialogDescription>
              Se eliminarán {count} reto{count === 1 ? "" : "s"} de tu lista. Esta acción no borra
              los retos para otros participantes ni impide volver a unirte con el código de
              invitación.
            </DialogDescription>
          </DialogHeader>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleClear} disabled={loading}>
              {loading ? "Limpiando..." : "Sí, limpiar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
