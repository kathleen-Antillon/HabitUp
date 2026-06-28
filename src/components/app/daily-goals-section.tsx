"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { updateDailyGoalsAction } from "@/actions/challenges";
import { DailyGoalsForm } from "@/components/app/daily-goals-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

type Props = {
  challengeId: string;
  goals: DailyGoal[];
  isCreator: boolean;
  isActiveMember: boolean;
  initialCompleted: string[];
  embedded?: boolean;
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

export function DailyGoalsSection({
  challengeId,
  goals,
  isCreator,
  isActiveMember,
  initialCompleted,
  embedded = false,
}: Props) {
  const router = useRouter();
  const [editableGoals, setEditableGoals] = useState<EditableGoal[]>(() =>
    toEditableGoals(goals)
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEditableGoals(toEditableGoals(goals));
  }, [goals]);

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

    if (result.error) {
      setError(result.error);
    } else {
      setMessage(result.success ?? "Objetivos guardados.");
      router.refresh();
    }

    setLoading(false);
  }

  const content = (
    <>
      {isCreator && (
        <div className="space-y-3">
          {editableGoals.map((goal, index) => (
            <div key={goal.key} className="flex gap-2">
              <Input
                value={goal.label}
                onChange={(e) => updateGoal(goal.key, e.target.value)}
                placeholder={`Objetivo ${index + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeGoal(goal.key)}
                aria-label="Eliminar objetivo"
              >
                <Trash2 className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
          ))}
          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addGoal}>
              <Plus className="mr-1 h-4 w-4" />
              Añadir objetivo
            </Button>
            <Button type="button" size="sm" onClick={handleSave} disabled={loading}>
              {loading ? "Guardando..." : "Guardar objetivos"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}
        </div>
      )}

      {isCreator && isActiveMember && goals.length > 0 && (
        <div className={cn(isCreator && "mt-6 border-t border-slate-200 pt-6")}>
          <p className="mb-3 text-sm font-semibold text-slate-700">Tu progreso de hoy</p>
          <DailyGoalsForm
            challengeId={challengeId}
            goals={goals}
            initialCompleted={initialCompleted}
          />
        </div>
      )}

      {!isCreator && isActiveMember && goals.length > 0 && (
        <DailyGoalsForm
          challengeId={challengeId}
          goals={goals}
          initialCompleted={initialCompleted}
        />
      )}

      {!isCreator && isActiveMember && goals.length === 0 && (
        <p className="text-sm text-slate-500">
          El creador del reto aún no ha definido objetivos diarios para completar.
        </p>
      )}

      {!isActiveMember && goals.length === 0 && (
        <p className="text-sm text-slate-500">
          Este reto aún no tiene objetivos diarios definidos.
        </p>
      )}

      {!isActiveMember && goals.length > 0 && (
        <ol className="space-y-2">
          {goals.map((goal, index) => (
            <li
              key={goal.id}
              className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                {index + 1}
              </span>
              {goal.label}
            </li>
          ))}
        </ol>
      )}
    </>
  );

  if (embedded) {
    return (
      <div>
        <h2 className="text-base font-semibold text-slate-900">Objetivos diarios</h2>
        <p className="mt-1 text-sm text-slate-500">
          {isCreator
            ? "Define o edita los objetivos que los participantes deben cumplir cada día."
            : isActiveMember
              ? "Marca los objetivos que completaste hoy en este reto."
              : "Objetivos diarios de este reto."}
        </p>
        <div className="mt-4">{content}</div>
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-base">Objetivos diarios</CardTitle>
        <CardDescription>
          {isCreator
            ? "Define o edita los objetivos que los participantes deben cumplir cada día."
            : isActiveMember
              ? "Marca los objetivos que completaste hoy en este reto."
              : "Objetivos diarios de este reto."}
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
