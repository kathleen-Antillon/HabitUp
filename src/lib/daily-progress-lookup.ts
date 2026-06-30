import { prisma } from "@/lib/db";
import { getDateKeyInTimezone } from "@/lib/timezone";

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

  return (
    rows.find((row) => getDateKeyInTimezone(row.date, timeZone) === dayKey) ?? null
  );
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
