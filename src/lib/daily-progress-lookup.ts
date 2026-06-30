import { prisma } from "@/lib/db";
import { getDateKeyInTimezone } from "@/lib/timezone";

function utcDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function matchesCalendarDay(rowDate: Date, dayKey: string, timeZone: string): boolean {
  if (getDateKeyInTimezone(rowDate, timeZone) === dayKey) return true;
  // Legacy rows stored as UTC midnight of the intended calendar day.
  return utcDateKey(rowDate) === dayKey;
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
