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
  value: string;
  onChange: (value: string) => void;
  min: string;
  max: string;
  id?: string;
  label?: string;
  required?: boolean;
};

const weekdayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(
    new Date(year, month, 1)
  );
}

export function SingleDatePicker({
  value,
  onChange,
  min,
  max,
  id,
  label = "Selecciona un día",
  required,
}: Props) {
  const [open, setOpen] = useState(false);
  const minDate = startOfDay(parseInputDate(min));
  const maxDate = startOfDay(parseInputDate(max));
  const anchor = value ? parseInputDate(value) : maxDate;
  const [viewYear, setViewYear] = useState(anchor.getFullYear());
  const [viewMonth, setViewMonth] = useState(anchor.getMonth());

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
    const nextAnchor = value ? parseInputDate(value) : maxDate;
    setViewYear(nextAnchor.getFullYear());
    setViewMonth(nextAnchor.getMonth());
    setOpen(true);
  }

  function handleDaySelect(date: Date) {
    onChange(toInputDate(date));
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

  const displayValue = value ? formatDate(value) : "Selecciona un día";

  return (
    <div className="min-w-0">
      {required && <input type="hidden" value={value} required readOnly />}
      <button
        id={id}
        type="button"
        onClick={openPicker}
        className="flex h-11 w-full min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left text-base ring-offset-white transition-colors hover:border-[#E07A5F]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F]/40 focus-visible:ring-offset-2 sm:text-sm"
      >
        <Calendar className="h-4 w-4 shrink-0 text-[#E07A5F]" />
        <span className={cn("min-w-0 truncate", !value && "text-slate-400")}>{displayValue}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              Elige el día que quieres reportar dentro del periodo del reto.
            </DialogDescription>
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
              const dayValue = toInputDate(date);
              const isSelected = dayValue === value;
              const isDisabled = dayStart < minDate || dayStart > maxDate;
              const isToday = dayStart.getTime() === startOfDay().getTime();

              return (
                <button
                  key={dayValue}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDaySelect(date)}
                  className={cn(
                    "aspect-square rounded-lg text-sm font-medium transition-colors",
                    isSelected
                      ? "bg-[#E07A5F] text-white"
                      : isDisabled
                        ? "cursor-not-allowed text-slate-300"
                        : "text-slate-700 hover:bg-slate-100",
                    isToday && !isSelected && !isDisabled && "ring-1 ring-[#E07A5F]/40"
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
