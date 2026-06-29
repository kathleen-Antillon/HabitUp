"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { updateDailyGoalsAction } from "@/actions/challenges";
import { outlineButtonClass, primaryButtonClass } from "@/components/landing/auth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DailyGoal = {
  id: string;
  label: string;
  order: number;
};

type EditableGoal = {
  key: string;
  id?: string;
  label: string;
};

function toEditableGoals(goals: DailyGoal[]): EditableGoal[] {
  if (goals.length === 0) {
    return [{ key: "new-0", label: "" }];
  }
  return goals.map((goal) => ({
    key: goal.id,
    id: goal.id,
    label: goal.label,
  }));
}

export function DailyGoalsManageCard({
  challengeId,
  goals,
}: {
  challengeId: string;
  goals: DailyGoal[];
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [editableGoals, setEditableGoals] = useState<EditableGoal[]>(() =>
    toEditableGoals(goals)
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEditableGoals(toEditableGoals(goals));
  }, [goals]);

  function openEditor() {
    setEditableGoals(toEditableGoals(goals));
    setError("");
    setMessage("");
    setExpanded(true);
  }

  function addGoal() {
    setEditableGoals((prev) => [...prev, { key: `new-${Date.now()}`, label: "" }]);
  }

  function removeGoal(key: string) {
    setEditableGoals((prev) => {
      const next = prev.filter((goal) => goal.key !== key);
      return next.length > 0 ? next : [{ key: `new-${Date.now()}`, label: "" }];
    });
  }

  function updateGoal(key: string, label: string) {
    setEditableGoals((prev) =>
      prev.map((goal) => (goal.key === key ? { ...goal, label } : goal))
    );
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    setMessage("");

    const payload = editableGoals.map(({ id, label }) => ({ id, label }));
    const result = await updateDailyGoalsAction(challengeId, payload);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setMessage(result.success ?? "Objetivos guardados.");
      router.refresh();
      setExpanded(false);
    } else {
      setError("No se pudieron guardar los objetivos. Inténtalo de nuevo.");
    }

    setLoading(false);
  }

  function handleCancel() {
    setEditableGoals(toEditableGoals(goals));
    setError("");
    setMessage("");
    setExpanded(false);
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {!expanded ? (
        <>
          <p className="text-sm font-semibold text-slate-900">
            ¿Deseas añadir o eliminar objetivos diarios?
          </p>
          <Button
            type="button"
            variant="outline"
            className={`mt-4 w-full ${outlineButtonClass}`}
            onClick={openEditor}
          >
            Gestionar objetivos
          </Button>
        </>
      ) : (
        <>
          <h2 className="text-base font-semibold text-slate-900">Añade objetivos diarios</h2>
          <p className="mt-1 text-sm text-slate-500">
            Define los objetivos que los participantes deben cumplir cada día.
          </p>

          <div className="mt-4 space-y-3">
            {editableGoals.map((goal, index) => (
              <div key={goal.key} className="flex gap-2">
                <Input
                  value={goal.label}
                  onChange={(e) => updateGoal(goal.key, e.target.value)}
                  placeholder={`Objetivo ${index + 1}`}
                  className="rounded-xl"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeGoal(goal.key)}
                  aria-label="Eliminar objetivo"
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-slate-400" />
                </Button>
              </div>
            ))}

            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={outlineButtonClass}
                onClick={addGoal}
              >
                <Plus className="mr-1 h-4 w-4" />
                Añadir objetivo
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className={`flex-1 ${outlineButtonClass}`}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className={`flex-1 ${primaryButtonClass}`}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar objetivos"}
              </Button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-slate-700">{message}</p>}
          </div>
        </>
      )}
    </article>
  );
}
