"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { ProgressByDate } from "@/lib/challenges";
import { cn, startOfDay, toInputDate } from "@/lib/utils";

type DayStatus = "outside" | "future" | "missing" | "complete" | "incomplete" | "today-complete" | "today-pending";

type Props = {
  startDate: Date | string;
  endDate: Date | string;
  progressByDate: ProgressByDate;
  todayGoalsComplete: boolean;
};

const weekdayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const statusStyles: Record<DayStatus, string> = {
  outside: "border-slate-100 bg-slate-50/50",
  future: "border-slate-200 bg-white",
  missing: "border-slate-200 bg-white",
  complete: "border-emerald-200 bg-emerald-100",
  incomplete: "border-slate-200 bg-slate-200",
  "today-complete": "border-emerald-400 bg-emerald-100 ring-2 ring-emerald-400 ring-offset-1",
  "today-pending": "border-amber-300 bg-amber-100 ring-2 ring-amber-400 ring-offset-1",
};

function getDayStatus(
  date: Date,
  startDate: Date,
  endDate: Date,
  today: Date,
  progressByDate: ProgressByDate,
  todayGoalsComplete: boolean
): DayStatus {
  const inChallenge = date >= startDate && date <= endDate;
  if (!inChallenge) return "outside";

  const isToday = date.getTime() === today.getTime();
  if (isToday) {
    return todayGoalsComplete ? "today-complete" : "today-pending";
  }

  if (date > today) return "future";

  const progress = progressByDate[toInputDate(date)];
  if (!progress) return "missing";
  if (progress.isComplete) return "complete";
  return "incomplete";
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(
    new Date(year, month, 1)
  );
}

function clampMonth(year: number, month: number, min: Date, max: Date) {
  const current = new Date(year, month, 1);
  const minMonth = new Date(min.getFullYear(), min.getMonth(), 1);
  const maxMonth = new Date(max.getFullYear(), max.getMonth(), 1);
  if (current < minMonth) return { year: minMonth.getFullYear(), month: minMonth.getMonth() };
  if (current > maxMonth) return { year: maxMonth.getFullYear(), month: maxMonth.getMonth() };
  return { year, month };
}

export function GoalsMonthCalendar({
  startDate,
  endDate,
  progressByDate,
  todayGoalsComplete,
}: Props) {
  const challengeStart = startOfDay(startDate);
  const challengeEnd = startOfDay(endDate);
  const today = startOfDay();

  const initial = clampMonth(today.getFullYear(), today.getMonth(), challengeStart, challengeEnd);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  const canGoPrev = useMemo(() => {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    const minMonth = new Date(challengeStart.getFullYear(), challengeStart.getMonth(), 1);
    return prev >= minMonth;
  }, [viewYear, viewMonth, challengeStart]);

  const canGoNext = useMemo(() => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    const maxMonth = new Date(challengeEnd.getFullYear(), challengeEnd.getMonth(), 1);
    return next <= maxMonth;
  }, [viewYear, viewMonth, challengeEnd]);

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startPadding = (firstOfMonth.getDay() + 6) % 7;

    const cells: { date: Date | null; status: DayStatus }[] = [];

    for (let i = 0; i < startPadding; i++) {
      cells.push({ date: null, status: "outside" });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewYear, viewMonth, day, 12);
      cells.push({
        date,
        status: getDayStatus(
          startOfDay(date),
          challengeStart,
          challengeEnd,
          today,
          progressByDate,
          todayGoalsComplete
        ),
      });
    }

    return cells;
  }, [
    viewYear,
    viewMonth,
    challengeStart,
    challengeEnd,
    today,
    progressByDate,
    todayGoalsComplete,
  ]);

  function goPrev() {
    if (!canGoPrev) return;
    const next = clampMonth(viewYear, viewMonth - 1, challengeStart, challengeEnd);
    setViewYear(next.year);
    setViewMonth(next.month);
  }

  function goNext() {
    if (!canGoNext) return;
    const next = clampMonth(viewYear, viewMonth + 1, challengeStart, challengeEnd);
    setViewYear(next.year);
    setViewMonth(next.month);
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold capitalize text-slate-900">
          {monthLabel(viewYear, viewMonth)}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canGoPrev}
            aria-label="Mes anterior"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            aria-label="Mes siguiente"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1.5">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((cell, index) =>
          cell.date ? (
            <div
              key={toInputDate(cell.date)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg border text-xs font-medium text-slate-600",
                statusStyles[cell.status]
              )}
              title={String(cell.date.getDate())}
            >
              {cell.date.getDate()}
            </div>
          ) : (
            <div key={`pad-${index}`} className="aspect-square" aria-hidden />
          )
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-emerald-200 bg-emerald-100" />
          Completado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-slate-200 bg-slate-200" />
          No cumplido
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-slate-200 bg-white" />
          Faltante
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-amber-300 bg-amber-100 ring-1 ring-amber-400" />
          Hoy pendiente
        </span>
      </div>
    </article>
  );
}
