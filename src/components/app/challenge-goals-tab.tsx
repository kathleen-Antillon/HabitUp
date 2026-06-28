"use client";

import { cn } from "@/lib/utils";
import { DailyGoalsProgress } from "@/components/app/daily-goals-progress";
import { DailyGoalsManageCard } from "@/components/app/daily-goals-manage-card";
import { GoalsMonthCalendar } from "@/components/app/goals-month-calendar";
import type { ProgressByDate } from "@/lib/challenges";

type DailyGoal = { id: string; label: string; order: number };

type Props = {
  challengeId: string;
  goals: DailyGoal[];
  isCreator: boolean;
  isActiveMember: boolean;
  initialCompleted: string[];
  currentDay: number;
  totalDays: number;
  daysRemaining: number;
  userCompletedDays: number;
  todayGoalsComplete: boolean;
  todayGoalsPartial: boolean;
  expandGoals?: boolean;
  startDate: Date | string;
  endDate: Date | string;
  progressByDate: ProgressByDate;
};

export function ChallengeGoalsTab({
  challengeId,
  goals,
  isCreator,
  isActiveMember,
  initialCompleted,
  currentDay,
  totalDays,
  daysRemaining,
  userCompletedDays,
  todayGoalsComplete,
  todayGoalsPartial,
  expandGoals = false,
  startDate,
  endDate,
  progressByDate,
}: Props) {
  const progressPercent =
    totalDays > 0 ? Math.round((userCompletedDays / totalDays) * 100) : 0;
  const dayToneComplete = todayGoalsComplete;

  function statusBanner() {
    if (todayGoalsComplete) {
      return (
        <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <strong>¡Día completado!</strong> Cumpliste todos tus objetivos de hoy.
        </div>
      );
    }
    if (todayGoalsPartial) {
      return (
        <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Casi completado.</strong> No te rindas, tú puedes con todo.
        </div>
      );
    }
    return (
      <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>En progreso.</strong> Marca tus objetivos de hoy.
      </div>
    );
  }

  const showStatusCard = isActiveMember || (!isCreator && goals.length > 0);

  return (
    <div className="space-y-4">
      {showStatusCard && (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {isActiveMember && goals.length > 0 && (
            <>
              <div className="text-center">
                {statusBanner()}
                <p
                  className={cn(
                    "text-4xl font-bold",
                    dayToneComplete ? "text-emerald-600" : "text-amber-600"
                  )}
                >
                  {currentDay}
                </p>
                <p className="mt-1 text-sm text-slate-500">Día del reto</p>
              </div>

              <div className="my-4 border-t border-slate-100" />

              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-bold text-slate-900">{daysRemaining}</p>
                  <p className="mt-1 text-xs text-slate-500">Días restantes</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{userCompletedDays}</p>
                  <p className="mt-1 text-xs text-slate-500">Días completados</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{progressPercent}%</p>
                  <p className="mt-1 text-xs text-slate-500">Progreso</p>
                </div>
              </div>

              <div className="my-4 border-t border-slate-100" />

              <DailyGoalsProgress
                challengeId={challengeId}
                goals={goals}
                initialCompleted={initialCompleted}
                defaultExpanded={expandGoals || !todayGoalsComplete}
                listTitle="¿Qué objetivos alcanzaste hoy?"
                completeButtonLabel={
                  todayGoalsComplete ? "Editar objetivos" : "Completar objetivos"
                }
              />
            </>
          )}

          {isActiveMember && goals.length === 0 && (
            <p className="text-sm text-slate-500">
              Aún no hay objetivos diarios para completar.{" "}
              {isCreator && "Añádelos en la sección de abajo."}
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

          {!isActiveMember && goals.length === 0 && (
            <p className="text-sm text-slate-500">
              Este reto aún no tiene objetivos diarios definidos.
            </p>
          )}
        </article>
      )}

      {isActiveMember && goals.length > 0 && (
        <GoalsMonthCalendar
          startDate={startDate}
          endDate={endDate}
          progressByDate={progressByDate}
          todayGoalsComplete={todayGoalsComplete}
        />
      )}

      {isCreator && (
        <DailyGoalsManageCard challengeId={challengeId} goals={goals} />
      )}
    </div>
  );
}
