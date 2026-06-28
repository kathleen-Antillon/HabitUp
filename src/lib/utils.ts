import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function startOfDay(date: Date | string = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toInputDate(value: Date | string): string {
  const d = new Date(value);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseInputDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return startOfDay(new Date(year, month - 1, day));
}

export function daysBetween(start: Date, end: Date): number {
  const ms = startOfDay(end).getTime() - startOfDay(start).getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1);
}

export function challengeDayNumber(startDate: Date | string, today: Date | string = new Date()): number {
  const ms = startOfDay(today).getTime() - startOfDay(startDate).getTime();
  return Math.max(1, Math.floor(ms / (1000 * 60 * 60 * 24)) + 1);
}

export { CHALLENGE_TYPE_LABELS } from "@/lib/challenge-types";

export function getUserStatus(completedChallenges: number): {
  label: string;
  color: string;
} {
  if (completedChallenges >= 10) return { label: "Campeón", color: "text-amber-600" };
  if (completedChallenges >= 5) return { label: "Constante", color: "text-emerald-600" };
  if (completedChallenges >= 1) return { label: "En camino", color: "text-blue-600" };
  return { label: "Principiante", color: "text-slate-600" };
}
