import { prisma } from "@/lib/db";
import { addDaysToDateKey, challengeDateKey, getDateKeyInTimezone } from "@/lib/timezone";

function utcDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

/** Normalize a stored progress date to one calendar day key. */
export function canonicalProgressDayKey(date: Date, timeZone: string): string {
  const utcKey = utcDateKey(date);
  const tzKey = getDateKeyInTimezone(date, timeZone);
  if (utcKey === tzKey) return tzKey;

  const isUtcMidnight =
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0;

  // Legacy rows used UTC midnight for the intended local calendar day.
  if (isUtcMidnight) return utcKey;
  return tzKey;
}

function matchesCalendarDay(rowDate: Date, dayKey: string, timeZone: string): boolean {
  return canonicalProgressDayKey(rowDate, timeZone) === dayKey;
}

/** Find progress row for a calendar day, tolerating legacy UTC-midnight dates. */
export async function findDailyProgressForDay(
  userId: string,
  challengeId: string,
  day: Date,
  timeZone: string
) {
  const dayKey = getDateKeyInTimezone(day, timeZone);

  const rows = await prisma.dailyProgress.findMany({
    where: { userId, challengeId },
  });

  return rows.find((row) => matchesCalendarDay(row.date, dayKey, timeZone)) ?? null;
}

export function countCompleteDaysByUser(
  progress: { userId: string; date: Date; isComplete: boolean }[],
  startDate: Date,
  endDate: Date,
  timeZone: string,
  todayKey?: string
): Record<string, number> {
  const startKey = challengeDateKey(startDate);
  const endKey = challengeDateKey(endDate);
  const today = todayKey ?? getDateKeyInTimezone(new Date(), timeZone);
  const effectiveEnd = today < endKey ? today : endKey;

  const completeByUserDay: Record<string, Set<string>> = {};
  for (const row of progress) {
    if (!row.isComplete) continue;
    const dayKey = canonicalProgressDayKey(row.date, timeZone);
    (completeByUserDay[row.userId] ??= new Set()).add(dayKey);
  }

  const counts: Record<string, number> = {};
  for (const userId of Object.keys(completeByUserDay)) {
    const completeDays = completeByUserDay[userId]!;
    let count = 0;
    let cursor = startKey;
    while (cursor <= effectiveEnd) {
      if (completeDays.has(cursor)) count++;
      cursor = addDaysToDateKey(cursor, 1);
    }
    counts[userId] = count;
  }

  return counts;
}

export function buildProgressByDate(
  entries: { date: Date; isComplete: boolean; isPartial: boolean }[],
  timeZone: string
): Record<string, { isComplete: boolean; isPartial: boolean }> {
  const byKey: Record<string, { isComplete: boolean; isPartial: boolean }> = {};

  for (const entry of entries) {
    const key = canonicalProgressDayKey(entry.date, timeZone);
    const existing = byKey[key];
    if (!existing) {
      byKey[key] = { isComplete: entry.isComplete, isPartial: entry.isPartial };
      continue;
    }
    const isComplete = existing.isComplete || entry.isComplete;
    byKey[key] = {
      isComplete,
      isPartial: !isComplete && (existing.isPartial || entry.isPartial),
    };
  }

  return byKey;
}

/** Match penitencias by calendar incident day, not exact UTC instant. */
export async function findMissedGoalsPenitenciaForDay(
  userId: string,
  challengeId: string,
  day: Date,
  timeZone: string
) {
  const dayKey = getDateKeyInTimezone(day, timeZone);

  const rows = await prisma.penitencia.findMany({
    where: { userId, challengeId, type: "MISSED_GOALS" },
  });

  return (
    rows.find(
      (row) => row.incidentDate && getDateKeyInTimezone(row.incidentDate, timeZone) === dayKey
    ) ?? null
  );
}
