import { prisma } from "@/lib/db";
import {
  didMissGoalsOnDate,
  getDailyGoalsForDate,
  type DailyGoalsMode,
} from "@/lib/challenges";
import { findDailyProgressForDay } from "@/lib/daily-progress-lookup";
import { ensureMissedGoalsPenitencia } from "@/lib/penitencias";
import {
  getDateKeyInTimezone,
  getTodayInTimezone,
  getYesterdayInTimezone,
} from "@/lib/timezone";
import { getUserTimezone } from "@/lib/user-timezone";

export type MissedGoalsProcessResult = {
  showMissedModal: boolean;
  todayDateKey: string;
  missedChallengeIds: string[];
};

export async function processMissedGoalsForUser(
  userId: string
): Promise<MissedGoalsProcessResult> {
  const timeZone = await getUserTimezone(userId);
  const now = new Date();
  const todayDateKey = getDateKeyInTimezone(now, timeZone);
  const yesterday = getYesterdayInTimezone(timeZone, now);

  const memberships = await prisma.challengeMember.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      challenge: {
        include: { dailyGoals: { orderBy: { order: "asc" } } },
      },
    },
  });

  const activeChallenges = memberships.filter((m) => m.challenge.status === "ACTIVE");
  const missedChallengeIds: string[] = [];

  for (const membership of activeChallenges) {
    const { challenge } = membership;
    const goals = getDailyGoalsForDate(
      challenge.dailyGoals,
      challenge.dailyGoalsMode as DailyGoalsMode,
      yesterday
    );

    if (goals.length === 0) continue;

    const yesterdayProgress = await findDailyProgressForDay(
      userId,
      challenge.id,
      yesterday,
      timeZone
    );

    const missed = didMissGoalsOnDate(
      challenge,
      yesterdayProgress,
      yesterday,
      timeZone,
      challenge.dailyGoalsMode
    );

    if (!missed) continue;

    missedChallengeIds.push(challenge.id);
    await ensureMissedGoalsPenitencia(userId, challenge.id, timeZone);
  }

  return {
    showMissedModal: missedChallengeIds.length > 0,
    todayDateKey,
    missedChallengeIds,
  };
}

/** Whether the user can still edit goals for the current calendar day. */
export function canCompleteGoalsForToday(timeZone: string, now = new Date()): boolean {
  const todayKey = getDateKeyInTimezone(now, timeZone);
  const todayStart = getTodayInTimezone(timeZone, now);
  return getDateKeyInTimezone(todayStart, timeZone) === todayKey;
}

export { getTodayInTimezone, getYesterdayInTimezone, getUserTimezone };
