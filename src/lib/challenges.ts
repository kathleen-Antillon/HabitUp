import { prisma } from "@/lib/db";
import {
  addDaysToDateKey,
  challengeDayNumberInTimezone,
  daysBetweenInTimezone,
  getDateKeyInTimezone,
  getTodayInTimezone,
  getYesterdayInTimezone,
  isDateWithinChallengeDay,
} from "@/lib/timezone";
import { findDailyProgressForDay } from "@/lib/daily-progress-lookup";
import { getUserTimezone } from "@/lib/user-timezone";
import { toInputDate } from "@/lib/utils";

export type DayProgressSnapshot = {
  isComplete: boolean;
  isPartial: boolean;
};

export type ProgressByDate = Record<string, DayProgressSnapshot>;

export type ChallengeRankingMember = {
  userId: string;
  username: string;
  completedDays: number;
  memberStatus: string;
};

export function sortChallengeRanking<T extends ChallengeRankingMember>(
  ranking: T[]
): T[] {
  const statusOrder = (status: string) => {
    if (status === "ACTIVE") return 0;
    if (status === "PENDING_JOIN") return 1;
    if (status === "LEFT") return 2;
    return 3;
  };

  return [...ranking].sort((a, b) => {
    const orderDiff = statusOrder(a.memberStatus) - statusOrder(b.memberStatus);
    if (orderDiff !== 0) return orderDiff;

    if (b.completedDays !== a.completedDays) {
      return b.completedDays - a.completedDays;
    }

    return a.username.localeCompare(b.username);
  });
}

export type DailyGoalsMode = "FIXED" | "VARIABLE";

export function getDailyGoalsForDate(
  dailyGoals: { id: string; label: string; order: number; date: Date | null }[],
  mode: DailyGoalsMode | string = "FIXED",
  date: Date = new Date(),
  timeZone?: string
) {
  if (mode === "VARIABLE") {
    const dayKey = timeZone ? getDateKeyInTimezone(date, timeZone) : date.toISOString().slice(0, 10);
    return dailyGoals
      .filter((goal) => goal.date && getDateKeyInTimezone(goal.date, timeZone ?? "UTC") === dayKey)
      .sort((a, b) => a.order - b.order);
  }

  const fixedGoals = dailyGoals.filter((goal) => !goal.date);
  const goals = fixedGoals.length > 0 ? fixedGoals : dailyGoals;
  return [...goals].sort((a, b) => a.order - b.order);
}

/** True when the user did not fully complete all daily goals for that calendar day. */
export function didMissGoalsOnDate(
  challenge: {
    startDate: Date;
    endDate: Date;
    dailyGoals: { id: string; label: string; order: number; date: Date | null }[];
  },
  dayProgress: { isComplete: boolean; completedGoalIds?: string } | null,
  day: Date,
  timeZone: string,
  mode: DailyGoalsMode | string = "FIXED"
) {
  if (!isDateWithinChallengeDay(day, challenge.startDate, challenge.endDate, timeZone)) {
    return false;
  }

  const goals = getDailyGoalsForDate(challenge.dailyGoals, mode, day, timeZone);
  if (goals.length === 0) return false;

  if (!dayProgress) return true;

  return !dayProgress.isComplete;
}

/** @deprecated Use didMissGoalsOnDate with explicit timezone. */
export function didMissAllGoalsYesterday(
  challenge: {
    startDate: Date;
    endDate: Date;
    dailyGoals: { id: string; label: string; order: number; date: Date | null }[];
  },
  yesterdayProgress: { completedGoalIds: string; isComplete?: boolean } | null,
  yesterday: Date,
  timeZone = "America/Bogota"
) {
  return didMissGoalsOnDate(
    challenge,
    yesterdayProgress
      ? { isComplete: yesterdayProgress.isComplete ?? false, completedGoalIds: yesterdayProgress.completedGoalIds }
      : null,
    yesterday,
    timeZone
  );
}

export async function getUserChallenges(userId: string) {
  const memberships = await prisma.challengeMember.findMany({
    where: { userId },
    include: {
      challenge: {
        include: {
          dailyGoals: { orderBy: { order: "asc" } },
          members: {
            where: { status: "ACTIVE" },
            include: { user: { select: { id: true, username: true } } },
          },
          createdBy: { select: { username: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return memberships.map((m) => ({
    ...m.challenge,
    memberStatus: m.status,
  }));
}

export async function getFocusChallenge(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { focusChallengeId: true },
  });

  const challenges = await getUserChallenges(userId);
  const active = challenges.filter((c) => c.status === "ACTIVE" && c.memberStatus === "ACTIVE");

  if (user?.focusChallengeId) {
    const focused = active.find((c) => c.id === user.focusChallengeId);
    if (focused) return focused;
  }

  return active[0] ?? null;
}

export async function getChallengeStats(userId: string, challengeId: string) {
  const timeZone = await getUserTimezone(userId);
  const now = new Date();
  const today = getTodayInTimezone(timeZone, now);
  const yesterday = getYesterdayInTimezone(timeZone, now);

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      dailyGoals: { orderBy: { order: "asc" } },
      createdBy: { select: { id: true, username: true } },
      members: {
        where: { status: { in: ["ACTIVE", "LEFT"] } },
        include: {
          user: { select: { id: true, username: true } },
        },
      },
    },
  });

  if (!challenge) return null;

  const totalDays = daysBetweenInTimezone(
    challenge.startDate,
    challenge.endDate,
    timeZone
  );
  const currentDay = Math.min(
    challengeDayNumberInTimezone(challenge.startDate, timeZone, today),
    totalDays
  );
  const daysRemaining = Math.max(0, totalDays - currentDay);

  const todayProgress = await findDailyProgressForDay(
    userId,
    challengeId,
    today,
    timeZone
  );

  const yesterdayProgress = await findDailyProgressForDay(
    userId,
    challengeId,
    yesterday,
    timeZone
  );

  const showMissedYesterdayModal = didMissGoalsOnDate(
    challenge,
    yesterdayProgress,
    yesterday,
    timeZone,
    challenge.dailyGoalsMode
  );

  const allProgress = await prisma.dailyProgress.findMany({
    where: { challengeId, isComplete: true },
    select: { userId: true },
  });

  const completedDaysByUser = allProgress.reduce<Record<string, number>>((acc, p) => {
    acc[p.userId] = (acc[p.userId] ?? 0) + 1;
    return acc;
  }, {});

  const pendingJoinRequests = await prisma.challengeJoinRequest
    .findMany({
      where: { challengeId, status: "PENDING" },
      include: {
        invitedUser: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "asc" },
    })
    .catch((error) => {
      console.error("[challenges] pending join requests query failed", error);
      return [];
    });

  const memberRanking = challenge.members.map((m) => ({
    userId: m.user.id,
    username: m.user.username,
    completedDays: completedDaysByUser[m.user.id] ?? 0,
    memberStatus: m.status,
  }));

  const pendingRanking = pendingJoinRequests.map((request) => ({
    userId: request.invitedUser.id,
    username: request.invitedUser.username,
    completedDays: 0,
    memberStatus: "PENDING_JOIN",
  }));

  const ranking = sortChallengeRanking([...memberRanking, ...pendingRanking]);

  const userCompletedDays = completedDaysByUser[userId] ?? 0;

  const goalsForToday = getDailyGoalsForDate(
    challenge.dailyGoals,
    challenge.dailyGoalsMode,
    today,
    timeZone
  );

  const userProgress = await prisma.dailyProgress.findMany({
    where: { userId, challengeId },
    select: { date: true, isComplete: true, isPartial: true },
  });

  const progressByDate = Object.fromEntries(
    userProgress.map((entry) => [
      getDateKeyInTimezone(entry.date, timeZone),
      { isComplete: entry.isComplete, isPartial: entry.isPartial },
    ])
  );

  const recentProgress = await prisma.dailyProgress.findMany({
    where: { userId, challengeId, isComplete: true },
    orderBy: { date: "desc" },
    take: 30,
  });

  let streak = 0;
  const sortedKeys = recentProgress
    .map((p) => getDateKeyInTimezone(p.date, timeZone))
    .sort((a, b) => b.localeCompare(a));

  let checkKey = getDateKeyInTimezone(today, timeZone);
  for (const key of sortedKeys) {
    if (key === checkKey) {
      streak++;
      checkKey = addDaysToDateKey(checkKey, -1);
    } else if (key < checkKey) {
      break;
    }
  }

  const showCelebration = streak > 0 && streak % 7 === 0;

  return {
    challenge: {
      ...challenge,
      dailyGoals: goalsForToday,
    },
    totalDays,
    currentDay,
    daysRemaining,
    todayProgress,
    ranking,
    userCompletedDays,
    streak,
    showCelebration,
    progressByDate,
    showMissedYesterdayModal,
  };
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      personalGoal: true,
      description: true,
      isNewUser: true,
    },
  });

  const completedCount = await prisma.challengeMember.count({
    where: { userId, status: "COMPLETED" },
  });

  return user ? { ...user, completedCount } : null;
}

export type GoalReportView = {
  id: string;
  date: string;
  reason: string | null;
  status: string;
  resolution: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  reportedUser: { id: string; username: string };
  reporter: { id: string; username: string };
  reportedProgress: {
    isComplete: boolean;
    isPartial: boolean;
    completedGoalLabels: string[];
  } | null;
};

type GoalReportRow = {
  id: string;
  reportedUserId: string;
  date: Date;
  reason: string | null;
  status: string;
  resolution: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  reportedUser: { id: string; username: string };
  reporter: { id: string; username: string };
};

async function mapGoalReportsToViews(
  challengeId: string,
  reports: GoalReportRow[]
): Promise<GoalReportView[]> {
  if (reports.length === 0) return [];

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: { dailyGoals: { orderBy: { order: "asc" } } },
  });

  if (!challenge) return [];

  const progressRows = await prisma.dailyProgress.findMany({
    where: {
      challengeId,
      userId: { in: reports.map((r) => r.reportedUserId) },
      date: { in: reports.map((r) => r.date) },
    },
  });

  const progressByKey = new Map(
    progressRows.map((p) => [`${p.userId}:${p.date.getTime()}`, p])
  );

  return reports.map((report) => {
    const progress = progressByKey.get(`${report.reportedUserId}:${report.date.getTime()}`);
    let completedGoalLabels: string[] = [];

    if (progress) {
      try {
        const ids: string[] = JSON.parse(progress.completedGoalIds);
        const goalsForDay = getDailyGoalsForDate(challenge.dailyGoals, "FIXED", report.date);
        const labelById = new Map(goalsForDay.map((g) => [g.id, g.label]));
        completedGoalLabels = ids.map((id) => labelById.get(id) ?? id);
      } catch {
        completedGoalLabels = [];
      }
    }

    return {
      id: report.id,
      date: toInputDate(report.date),
      reason: report.reason,
      status: report.status,
      resolution: report.resolution,
      resolvedAt: report.resolvedAt,
      createdAt: report.createdAt,
      reportedUser: report.reportedUser,
      reporter: report.reporter,
      reportedProgress: progress
        ? {
            isComplete: progress.isComplete,
            isPartial: progress.isPartial,
            completedGoalLabels,
          }
        : null,
    };
  });
}

const reportInclude = {
  reportedUser: { select: { id: true, username: true } },
  reporter: { select: { id: true, username: true } },
} as const;

export async function getAllGoalReportsForChallenge(
  challengeId: string
): Promise<GoalReportView[]> {
  const reports = await prisma.goalReport.findMany({
    where: { challengeId },
    include: reportInclude,
    orderBy: { createdAt: "desc" },
  });

  return mapGoalReportsToViews(challengeId, reports);
}

export async function getGoalReportsForChallenge(
  challengeId: string,
  viewerId: string,
  isCreator: boolean
): Promise<GoalReportView[]> {
  const reports = await prisma.goalReport.findMany({
    where: {
      challengeId,
      ...(isCreator ? { status: "PENDING" } : { reporterUserId: viewerId }),
    },
    include: reportInclude,
    orderBy: { createdAt: "desc" },
  });

  return mapGoalReportsToViews(challengeId, reports);
}

export async function getPendingReportIdsAgainstUser(
  userId: string,
  challengeId: string
): Promise<string[]> {
  const reports = await prisma.goalReport.findMany({
    where: {
      challengeId,
      reportedUserId: userId,
      status: "PENDING",
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  return reports.map((r) => r.id);
}
