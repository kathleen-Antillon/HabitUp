"use client";

import { useState } from "react";
import { deleteChallengeAction, leaveChallengeAction } from "@/actions/challenges";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  challengeId: string;
  challengeName: string;
  isCreator: boolean;
  isActiveMember: boolean;
  embedded?: boolean;
};

export function ChallengeManageActions({
  challengeId,
  challengeName,
  isCreator,
  isActiveMember,
  embedded = false,
}: Props) {
  const [loading, setLoading] = useState<"leave" | "delete" | null>(null);
  const [error, setError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  if (!isActiveMember && !isCreator) return null;

  async function handleLeave() {
    if (
      !confirm(
        "¿Quieres dejar este reto? Podrás volver a unirte más tarde con el código de invitación."
      )
    ) {
      return;
    }

    setLoading("leave");
    setError("");
    const result = await leaveChallengeAction(challengeId);
    if (result?.error) {
      setError(result.error);
      setLoading(null);
    }
  }

  async function handleDelete() {
    setLoading("delete");
    setError("");
    const result = await deleteChallengeAction(challengeId);
    if (result?.error) {
      setError(result.error);
      setLoading(null);
      setDeleteModalOpen(false);
    }
  }

  return (
    <>
      <div
        className={cn(
          "space-y-3",
          !embedded && "mt-6 border-t border-slate-200 pt-6"
        )}
      >
        <p className="text-sm font-semibold text-slate-700">Gestionar participación</p>
        {error && <p className="text-sm text-red-600">{error}</p>}

        {isActiveMember && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading !== null}
            onClick={handleLeave}
          >
            {loading === "leave" ? "Saliendo..." : "Dejar el reto"}
          </Button>
        )}

        {isCreator && (
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => setDeleteModalOpen(true)}
            className="w-full py-2 text-center text-sm text-slate-500 transition-colors hover:text-red-600 disabled:opacity-50"
          >
            Eliminar reto
          </button>
        )}
      </div>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar este reto?</DialogTitle>
            <DialogDescription>
              Vas a eliminar <strong>{challengeName}</strong> de forma permanente. Se borrará
              para todos los participantes y no podrás deshacer esta acción.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={loading === "delete"}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading === "delete"}
            >
              {loading === "delete" ? "Eliminando..." : "Sí, eliminar reto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
