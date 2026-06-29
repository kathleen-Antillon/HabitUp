"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatDate, parseInputDate, startOfDay, toInputDate } from "@/lib/utils";

type Props = {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  startName?: string;
  endName?: string;
  label?: string;
};

const weekdayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(
    new Date(year, month, 1)
  );
}

function isBetween(date: Date, start: Date, end: Date) {
  const time = date.getTime();
  return time >= start.getTime() && time <= end.getTime();
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  startName = "startDate",
  endName = "endDate",
  label = "Fechas del reto",
}: Props) {
  const [open, setOpen] = useState(false);
  const today = startOfDay();
  const initialMonth = startDate ? parseInputDate(startDate) : today;
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialMonth.getMonth());
  const [draftStart, setDraftStart] = useState<string | null>(null);
  const [draftEnd, setDraftEnd] = useState<string | null>(null);

  const activeStart = draftStart ?? startDate;
  const activeEnd = draftEnd ?? endDate;

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startPadding = (firstOfMonth.getDay() + 6) % 7;
    const cells: (Date | null)[] = [];

    for (let i = 0; i < startPadding; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(viewYear, viewMonth, day, 12));
    }

    return cells;
  }, [viewYear, viewMonth]);

  function openPicker() {
    setDraftStart(startDate || null);
    setDraftEnd(endDate || null);
    const anchor = startDate ? parseInputDate(startDate) : today;
    setViewYear(anchor.getFullYear());
    setViewMonth(anchor.getMonth());
    setOpen(true);
  }

  function handleDaySelect(date: Date) {
    const value = toInputDate(date);

    if (!draftStart || draftEnd || value < draftStart) {
      setDraftStart(value);
      setDraftEnd(null);
      return;
    }

    setDraftEnd(value);
    onChange(draftStart, value);
    setOpen(false);
  }

  function goPrevMonth() {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(prev.getFullYear());
    setViewMonth(prev.getMonth());
  }

  function goNextMonth() {
    const next = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  const displayValue =
    startDate && endDate
      ? `${formatDate(startDate)} — ${formatDate(endDate)}`
      : "Selecciona inicio y fin";

  const selectionHint =
    draftStart && !draftEnd
      ? `Inicio: ${formatDate(draftStart)}. Elige la fecha de fin.`
      : "Elige la fecha de inicio y luego la de fin.";

  return (
    <div>
      <input type="hidden" name={startName} value={startDate} />
      <input type="hidden" name={endName} value={endDate} />

      <button
        type="button"
        onClick={openPicker}
        className="flex h-11 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left text-sm ring-offset-white transition-colors hover:border-[#E07A5F]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F]/40 focus-visible:ring-offset-2"
      >
        <Calendar className="h-4 w-4 shrink-0 text-[#E07A5F]" />
        <span className={cn(!startDate && "text-slate-400")}>{displayValue}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>{selectionHint}</DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="Mes anterior"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold capitalize text-slate-900">
              {monthLabel(viewYear, viewMonth)}
            </p>
            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Mes siguiente"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekdayLabels.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`pad-${index}`} className="aspect-square" aria-hidden />;
              }

              const dayStart = startOfDay(date);
              const value = toInputDate(date);
              const rangeStart = activeStart ? startOfDay(parseInputDate(activeStart)) : null;
              const rangeEnd = activeEnd ? startOfDay(parseInputDate(activeEnd)) : null;
              const isStart = value === activeStart;
              const isEnd = value === activeEnd;
              const inRange =
                rangeStart && rangeEnd ? isBetween(dayStart, rangeStart, rangeEnd) : false;
              const isToday = dayStart.getTime() === today.getTime();

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleDaySelect(date)}
                  className={cn(
                    "aspect-square rounded-lg text-sm font-medium transition-colors",
                    isStart || isEnd
                      ? "bg-[#E07A5F] text-white"
                      : inRange
                        ? "bg-[#E07A5F]/15 text-[#334155]"
                        : "text-slate-700 hover:bg-slate-100",
                    isToday && !isStart && !isEnd && !inRange && "ring-1 ring-[#E07A5F]/40"
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
