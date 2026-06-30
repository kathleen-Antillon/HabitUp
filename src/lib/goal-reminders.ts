import { prisma } from "@/lib/db";
import { findDailyProgressForDay } from "@/lib/daily-progress-lookup";
import { getDailyGoalsForDate, type DailyGoalsMode } from "@/lib/challenges";
import { buildGoalReminderEmail } from "@/lib/emails/goal-reminder-template";
import { sendEmail } from "@/lib/email";
import { getAppBaseUrl } from "@/lib/app-url";
import {
  formatLongDateInTimezone,
  getDateKeyInTimezone,
  getLocalHour,
  getTodayInTimezone,
  isDateWithinChallengeDay,
  resolveTimezone,
} from "@/lib/timezone";

export type GoalReminderRunResult = {
  checked: number;
  sent: number;
  skipped: number;
  errors: number;
};

function getReminderHour(): number {
  const parsed = Number(process.env.GOAL_REMINDER_HOUR ?? "20");
  if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 23) return parsed;
  return 20;
}

type PendingChallenge = {
  id: string;
  name: string;
  goalsCount: number;
  completedCount: number;
};

async function getPendingChallengesForUser(
  userId: string,
  timeZone: string,
  today: Date
): Promise<PendingChallenge[]> {
  const memberships = await prisma.challengeMember.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      challenge: {
        include: { dailyGoals: { orderBy: { order: "asc" } } },
      },
    },
  });

  const pending: PendingChallenge[] = [];

  for (const membership of memberships) {
    const { challenge } = membership;
    if (challenge.status !== "ACTIVE") continue;

    if (!isDateWithinChallengeDay(today, challenge.startDate, challenge.endDate, timeZone)) {
      continue;
    }

    const goals = getDailyGoalsForDate(
      challenge.dailyGoals,
      challenge.dailyGoalsMode as DailyGoalsMode,
      today,
      timeZone
    );

    if (goals.length === 0) continue;

    const progress = await findDailyProgressForDay(userId, challenge.id, today, timeZone);

    if (progress?.isComplete) continue;

    let completedCount = 0;
    if (progress?.completedGoalIds) {
      try {
        const ids: string[] = JSON.parse(progress.completedGoalIds);
        completedCount = ids.length;
      } catch {
        completedCount = 0;
      }
    }

    pending.push({
      id: challenge.id,
      name: challenge.name,
      goalsCount: goals.length,
      completedCount,
    });
  }

  return pending;
}

export async function sendGoalRemindersForDueUsers(
  now = new Date()
): Promise<GoalReminderRunResult> {
  const reminderHour = getReminderHour();
  const baseUrl = getAppBaseUrl();
  const result: GoalReminderRunResult = { checked: 0, sent: 0, skipped: 0, errors: 0 };

  const users = await prisma.user.findMany({
    where: {
      email: { not: "" },
      memberships: { some: { status: "ACTIVE" } },
    },
    select: { id: true, username: true, email: true, timezone: true },
  });

  for (const user of users) {
    result.checked += 1;
    const timeZone = resolveTimezone(user.timezone);
    const localHour = getLocalHour(timeZone, now);

    if (localHour !== reminderHour) {
      result.skipped += 1;
      continue;
    }

    const dateKey = getDateKeyInTimezone(now, timeZone);
    const alreadySent = await prisma.goalReminderLog.findUnique({
      where: { userId_dateKey: { userId: user.id, dateKey } },
    });

    if (alreadySent) {
      result.skipped += 1;
      continue;
    }

    const today = getTodayInTimezone(timeZone, now);
    const pendingChallenges = await getPendingChallengesForUser(user.id, timeZone, today);

    if (pendingChallenges.length === 0) {
      result.skipped += 1;
      continue;
    }

    const { subject, html, text } = buildGoalReminderEmail({
      username: user.username,
      dateLabel: formatLongDateInTimezone(timeZone, now),
      homeUrl: `${baseUrl}/app/home`,
      challenges: pendingChallenges.map((c) => ({
        name: c.name,
        goalsCount: c.goalsCount,
        completedCount: c.completedCount,
        url: `${baseUrl}/app/challenges/${c.id}?tab=objetivos&open=1`,
      })),
    });

    const ok = await sendEmail({ to: user.email, subject, html, text });

    if (!ok) {
      result.errors += 1;
      continue;
    }

    await prisma.goalReminderLog.create({
      data: { userId: user.id, dateKey },
    });

    result.sent += 1;
  }

  return result;
}

/** Dev/manual helper — bypasses hour check, still dedupes by dateKey. */
export async function sendGoalReminderToUser(
  userId: string,
  options?: { force?: boolean }
): Promise<{ sent: boolean; reason?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, timezone: true },
  });

  if (!user?.email) return { sent: false, reason: "Usuario sin correo." };

  const timeZone = resolveTimezone(user.timezone);
  const now = new Date();
  const dateKey = getDateKeyInTimezone(now, timeZone);

  if (!options?.force) {
    const alreadySent = await prisma.goalReminderLog.findUnique({
      where: { userId_dateKey: { userId: user.id, dateKey } },
    });
    if (alreadySent) return { sent: false, reason: "Ya se envió hoy." };
  }

  const today = getTodayInTimezone(timeZone, now);
  const pendingChallenges = await getPendingChallengesForUser(user.id, timeZone, today);

  if (pendingChallenges.length === 0) {
    return { sent: false, reason: "No hay objetivos pendientes hoy." };
  }

  const baseUrl = getAppBaseUrl();
  const { subject, html, text } = buildGoalReminderEmail({
    username: user.username,
    dateLabel: formatLongDateInTimezone(timeZone, now),
    homeUrl: `${baseUrl}/app/home`,
    challenges: pendingChallenges.map((c) => ({
      name: c.name,
      goalsCount: c.goalsCount,
      completedCount: c.completedCount,
      url: `${baseUrl}/app/challenges/${c.id}?tab=objetivos&open=1`,
    })),
  });

  const ok = await sendEmail({ to: user.email, subject, html, text });
  if (!ok) return { sent: false, reason: "No se pudo enviar el correo." };

  await prisma.goalReminderLog.upsert({
    where: { userId_dateKey: { userId: user.id, dateKey } },
    create: { userId: user.id, dateKey },
    update: { sentAt: now },
  });

  return { sent: true };
}
