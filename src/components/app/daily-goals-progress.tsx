"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveDailyProgressAction } from "@/actions/challenges";
import { Button } from "@/components/ui/button";
import { outlineButtonClass } from "@/components/landing/auth-buttons";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type DailyGoal = { id: string; label: string };

type Props = {
  challengeId: string;
  goals: DailyGoal[];
  initialCompleted: string[];
  defaultExpanded?: boolean;
  listTitle?: string;
  completeButtonLabel?: string;
};

export function DailyGoalsProgress({
  challengeId,
  goals,
  initialCompleted,
  defaultExpanded = false,
  listTitle,
  completeButtonLabel = "Completar objetivos",
}: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [completed, setCompleted] = useState<string[]>(initialCompleted);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCompleted(initialCompleted);
  }, [initialCompleted]);

  function toggleGoal(goalId: string) {
    setCompleted((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  }

  async function handleSave() {
    setLoading(true);
    setMessage("");
    const result = await saveDailyProgressAction(challengeId, completed);
    if (result?.error) {
      setMessage(result.error);
    } else if (result?.success) {
      setMessage("¡Progreso guardado!");
      router.refresh();
      setExpanded(false);
    } else {
      setMessage("No se pudo guardar. Inténtalo de nuevo.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      {!expanded ? (
        <Button
          type="button"
          variant="outline"
          className={cn("h-11 w-full font-semibold", outlineButtonClass)}
          onClick={() => setExpanded(true)}
        >
          {completeButtonLabel}
        </Button>
      ) : (
        <>
          {listTitle && (
            <p className="text-sm font-semibold text-slate-900">{listTitle}</p>
          )}
          <div className="space-y-2">
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

          {message && (
            <p
              className={cn(
                "text-sm",
                message.includes("guardado") ? "text-emerald-600" : "text-red-600"
              )}
            >
              {message}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1"
              onClick={() => setExpanded(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="h-11 flex-1"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
