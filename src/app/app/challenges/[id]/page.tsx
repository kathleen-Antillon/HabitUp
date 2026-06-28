import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllGoalReportsForChallenge, getChallengeStats, getPendingReportIdsAgainstUser } from "@/lib/challenges";
import { prisma } from "@/lib/db";
import { ChallengeDetailView } from "@/components/app/challenge-detail-view";

export default async function ChallengeDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { tab?: string; open?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const membership = await prisma.challengeMember.findUnique({
    where: {
      userId_challengeId: { userId: session.id, challengeId: params.id },
    },
  });

  const stats = await getChallengeStats(session.id, params.id);
  if (!stats) notFound();

  const { challenge, currentDay, totalDays, daysRemaining, todayProgress, ranking, userCompletedDays, progressByDate } =
    stats;
  const isLeft = membership?.status === "LEFT";
  const isCreator = challenge.createdById === session.id;
  const isActiveMember = membership?.status === "ACTIVE";

  const completedGoalIds: string[] = todayProgress
    ? JSON.parse(todayProgress.completedGoalIds)
    : [];

  const initialTab =
    searchParams?.tab === "objetivos"
      ? ("goals" as const)
      : searchParams?.tab === "reportes" && isCreator
        ? ("reports" as const)
        : undefined;
  const expandGoals = searchParams?.open === "1";

  const allReports = isCreator
    ? await getAllGoalReportsForChallenge(params.id)
    : [];

  const pendingReportsAgainstUser = await getPendingReportIdsAgainstUser(
    session.id,
    params.id
  );

  return (
    <ChallengeDetailView
      challenge={{
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        type: challenge.type,
        mainGoal: challenge.mainGoal,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        inviteCode: challenge.inviteCode,
        createdBy: challenge.createdBy,
        createdById: challenge.createdById,
        dailyGoals: challenge.dailyGoals,
      }}
      currentUserId={session.id}
      isCreator={isCreator}
      isActiveMember={isActiveMember}
      isLeft={isLeft}
      completedGoalIds={completedGoalIds}
      currentDay={currentDay}
      totalDays={totalDays}
      daysRemaining={daysRemaining}
      userCompletedDays={userCompletedDays}
      todayGoalsComplete={!!todayProgress?.isComplete}
      todayGoalsPartial={!!todayProgress?.isPartial}
      ranking={ranking}
      initialTab={initialTab}
      expandGoals={expandGoals}
      progressByDate={progressByDate}
      allReports={allReports}
      pendingReportsAgainstUser={pendingReportsAgainstUser}
    />
  );
}
