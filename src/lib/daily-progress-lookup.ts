import { prisma } from "@/lib/db";
import {
  addDaysToDateKey,
  challengeDateKey,
  dateKeyToUtcDate,
  getDateKeyInTimezone,
} from "@/lib/timezone";

function utcDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

/** Whether a stored progress row belongs to a calendar day (handles legacy UTC saves). */
export function progressMatchesCalendarDay(
  rowDate: Date,
  dayKey: string,
  timeZone: string
): boolean {
  return (
    getDateKeyInTimezone(rowDate, timeZone) === dayKey || utcDateKey(rowDate) === dayKey
  );
}

type ProgressRow = {
  id: string;
  date: Date;
  isComplete: boolean;
  isPartial?: boolean;
};

export function pickBestProgressRow<T extends ProgressRow>(rows: T[]): T | null {
  if (rows.length === 0) return null;

  return [...rows].sort((a, b) => {
    if (a.isComplete !== b.isComplete) return a.isComplete ? -1 : 1;

    const aUtcMidnight =
      a.date.getUTCHours() === 0 &&
      a.date.getUTCMinutes() === 0 &&
      a.date.getUTCSeconds() === 0 &&
      a.date.getUTCMilliseconds() === 0;
    const bUtcMidnight =
      b.date.getUTCHours() === 0 &&
      b.date.getUTCMinutes() === 0 &&
      b.date.getUTCSeconds() === 0 &&
      b.date.getUTCMilliseconds() === 0;

    if (aUtcMidnight !== bUtcMidnight) return aUtcMidnight ? 1 : -1;
    return b.date.getTime() - a.date.getTime();
  })[0];
}

export function findMatchingProgressRows<T extends ProgressRow>(
  rows: T[],
  dayKey: string,
  timeZone: string
): T[] {
  return rows.filter((row) => progressMatchesCalendarDay(row.date, dayKey, timeZone));
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

  return pickBestProgressRow(findMatchingProgressRows(rows, dayKey, timeZone));
}

export function countCompleteDaysByUser(
  progress: { id: string; userId: string; date: Date; isComplete: boolean }[],
  startDate: Date,
  endDate: Date,
  timeZone: string,
  todayKey?: string
): Record<string, number> {
  const startKey = challengeDateKey(startDate);
  const endKey = challengeDateKey(endDate);
  const today = todayKey ?? getDateKeyInTimezone(new Date(), timeZone);
  const effectiveEnd = today < endKey ? today : endKey;

  const progressByUser: Record<string, typeof progress> = {};
  for (const row of progress) {
    (progressByUser[row.userId] ??= []).push(row);
  }

  const counts: Record<string, number> = {};
  for (const [userId, rows] of Object.entries(progressByUser)) {
    const usedIds = new Set<string>();
    let count = 0;
    let cursor = startKey;

    while (cursor <= effectiveEnd) {
      const match = rows.find(
        (row) =>
          row.isComplete &&
          !usedIds.has(row.id) &&
          progressMatchesCalendarDay(row.date, cursor, timeZone)
      );

      if (match) {
        count++;
        usedIds.add(match.id);
      }

      cursor = addDaysToDateKey(cursor, 1);
    }

    counts[userId] = count;
  }

  return counts;
}

export function buildProgressByDate(
  entries: { id?: string; date: Date; isComplete: boolean; isPartial: boolean }[],
  timeZone: string,
  startKey?: string,
  endKey?: string
): Record<string, { isComplete: boolean; isPartial: boolean }> {
  const byKey: Record<string, { isComplete: boolean; isPartial: boolean }> = {};
  if (!startKey || !endKey) {
    for (const entry of entries) {
      const key = getDateKeyInTimezone(entry.date, timeZone);
      mergeProgressEntry(byKey, key, entry);
      const utcKey = utcDateKey(entry.date);
      if (utcKey !== key) mergeProgressEntry(byKey, utcKey, entry);
    }
    return byKey;
  }

  const usedIds = new Set<string>();
  let cursor = startKey;
  while (cursor <= endKey) {
    const match = pickBestProgressRow(
      findMatchingProgressRows(
        entries.filter((e) => !e.id || !usedIds.has(e.id)) as ProgressRow[],
        cursor,
        timeZone
      )
    );

    if (match) {
      if (match.id) usedIds.add(match.id);
      byKey[cursor] = {
        isComplete: match.isComplete,
        isPartial: match.isPartial ?? false,
      };
    }

    cursor = addDaysToDateKey(cursor, 1);
  }

  return byKey;
}

function mergeProgressEntry(
  byKey: Record<string, { isComplete: boolean; isPartial: boolean }>,
  key: string,
  entry: { isComplete: boolean; isPartial: boolean }
) {
  const existing = byKey[key];
  if (!existing) {
    byKey[key] = { isComplete: entry.isComplete, isPartial: entry.isPartial };
    return;
  }
  const isComplete = existing.isComplete || entry.isComplete;
  byKey[key] = {
    isComplete,
    isPartial: !isComplete && (existing.isPartial || entry.isPartial),
  };
}

/** @deprecated Use progressMatchesCalendarDay for matching. */
export function canonicalProgressDayKey(date: Date, timeZone: string): string {
  return getDateKeyInTimezone(date, timeZone);
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
      (row) =>
        row.incidentDate && progressMatchesCalendarDay(row.incidentDate, dayKey, timeZone)
    ) ?? null
  );
}

export { dateKeyToUtcDate };
