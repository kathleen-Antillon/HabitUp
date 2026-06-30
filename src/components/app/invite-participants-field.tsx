"use client";

import { Plus, Trash2, UserPlus } from "lucide-react";
import { outlineButtonClass } from "@/components/landing/auth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  invites: string[];
  onChange: (invites: string[]) => void;
};

export function InviteParticipantsField({ invites, onChange }: Props) {
  function addInvite() {
    onChange([...invites, ""]);
  }

  function removeInvite(index: number) {
    onChange(invites.filter((_, i) => i !== index));
  }

  function updateInvite(index: number, value: string) {
    const updated = [...invites];
    updated[index] = value;
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {invites.length === 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-relaxed text-slate-500">
          <UserPlus className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <span>
            Sin invitaciones todavía. Puedes añadir participantes ahora o compartir el link después.
          </span>
        </div>
      ) : (
        invites.map((invite, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={invite}
              onChange={(e) => updateInvite(i, e.target.value)}
              placeholder="usuario o email@ejemplo.com"
              className="rounded-xl"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeInvite(i)}
              aria-label="Eliminar participante"
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4 text-slate-400" />
            </Button>
          </div>
        ))
      )}
      <div className="pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={outlineButtonClass}
          onClick={addInvite}
        >
          <Plus className="mr-1 h-4 w-4" /> Añadir participante
        </Button>
      </div>
    </div>
  );
}
