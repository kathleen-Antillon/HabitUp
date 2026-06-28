"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveDailyProgressAction } from "@/actions/challenges";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type DailyGoal = { id: string; label: string };

export function DailyGoalsForm({
  challengeId,
  goals,
  initialCompleted,
}: {
  challengeId: string;
  goals: DailyGoal[];
  initialCompleted: string[];
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState<string[]>(initialCompleted);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleGoal(goalId: string) {
    setCompleted((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  }

  async function handleSave() {
    setLoading(true);
    setMessage("");
    const result = await saveDailyProgressAction(challengeId, completed);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage("¡Progreso guardado!");
      router.refresh();
    }
    setLoading(false);
  }

  const total = goals.length;
  const done = completed.length;
  const isComplete = total > 0 && done === total;
  const isPartial = done > 0 && done < total;

  if (goals.length === 0) {
    return (
      <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-600">
        Aún no hay objetivos diarios para completar en este reto.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isPartial && (
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Casi completado.</strong> No te rindas, tú puedes con todo.
        </div>
      )}
      {isComplete && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          <strong>¡Día completado!</strong> Cumpliste todos tus objetivos de hoy.
        </div>
      )}

      <div className="space-y-3">
        {goals.map((goal) => (
          <label
            key={goal.id}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
          >
            <Checkbox
              checked={completed.includes(goal.id)}
              onCheckedChange={() => toggleGoal(goal.id)}
            />
            <span className="text-sm font-medium text-slate-900">{goal.label}</span>
          </label>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Puedes editar tu selección durante el mismo día. Si no guardas, el día quedará incompleto.
      </p>

      {message && (
        <p className={`text-sm ${message.includes("guardado") ? "text-emerald-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} className="w-full sm:w-auto" disabled={loading}>
          {loading ? "Guardando..." : "Guardar progreso de hoy"}
        </Button>
      </div>
    </div>
  );
}
