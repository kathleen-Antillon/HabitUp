"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccountAction, logoutAction, updateProfileAction } from "@/actions/auth";
import { getUserStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Profile = {
  username: string;
  email: string;
  personalGoal: string | null;
  description: string | null;
  completedCount: number;
};

export function ProfileClient({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [description, setDescription] = useState(profile.description ?? "");
  const [editing, setEditing] = useState(!profile.description);
  const [message, setMessage] = useState("");
  const status = getUserStatus(profile.completedCount);

  async function handleSaveDescription() {
    const formData = new FormData();
    formData.set("description", description);
    const result = await updateProfileAction(formData);
    setMessage(result.success ?? result.error ?? "");
    setEditing(false);
    router.refresh();
  }

  async function handleLogout() {
    await logoutAction();
  }

  async function handleDelete() {
    if (confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) {
      await deleteAccountAction();
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl font-bold text-emerald-700">
          {profile.username[0]?.toUpperCase()}
        </div>
        <h2 className="text-xl font-bold text-slate-900">{profile.username}</h2>
        <p className="text-sm text-slate-500">{profile.email}</p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <Badge variant="success">{status.label}</Badge>
          <Badge variant="outline">{profile.completedCount} retos completados</Badge>
        </div>
      </div>

      {profile.personalGoal && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-500">Mi objetivo</h3>
          <p className="text-slate-700">{profile.personalGoal}</p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-500">Descripción</h3>
        {editing ? (
          <div className="space-y-3">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cuéntanos sobre ti..."
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveDescription}>Guardar</Button>
              {profile.description && (
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-slate-700">{profile.description || "Sin descripción"}</p>
            <Button size="sm" variant="ghost" className="mt-2" onClick={() => setEditing(true)}>
              {profile.description ? "Editar" : "Añadir descripción"}
            </Button>
          </div>
        )}
        {message && <p className="mt-2 text-sm text-emerald-600">{message}</p>}
      </div>

      <div className="space-y-3 pt-2">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Cerrar sesión
        </Button>
        <button
          type="button"
          onClick={handleDelete}
          className="w-full py-2 text-center text-sm text-slate-500 transition-colors hover:text-red-600"
        >
          Eliminar cuenta
        </button>
      </div>
    </div>
  );
}
