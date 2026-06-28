import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getChallengeStats, getFocusChallenge, getPendingReportIdsAgainstUser, getUserChallenges } from "@/lib/challenges";
import { HomeClientWrapper } from "@/components/app/home-client-wrapper";
import { Button } from "@/components/ui/button";
import { ChallengeActionModal } from "@/components/app/challenge-action-modal";
import { AppPageTitle } from "@/components/app/app-page-title";
import { HomeChallengeCard } from "@/components/app/home-challenge-card";
import { Target } from "lucide-react";

async function getChallengeWithStats(userId: string, challengeId: string) {
  const stats = await getChallengeStats(userId, challengeId);
  if (!stats) return null;
  return stats;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { welcome?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const challenges = await getUserChallenges(session.id);
  const activeChallenges = challenges.filter(
    (c) => c.status === "ACTIVE" && c.memberStatus === "ACTIVE"
  );
  const focusChallenge = await getFocusChallenge(session.id);
  const showWelcome = searchParams.welcome === "1" || session.isNewUser;

  const secondaryChallenges = focusChallenge
    ? activeChallenges.filter((c) => c.id !== focusChallenge.id)
    : [];

  const focusStats = focusChallenge
    ? await getChallengeWithStats(session.id, focusChallenge.id)
    : null;

  const policeReportIds = focusChallenge
    ? await getPendingReportIdsAgainstUser(session.id, focusChallenge.id)
    : [];

  const secondaryWithStats = await Promise.all(
    secondaryChallenges.map(async (challenge) => ({
      challenge,
      stats: await getChallengeWithStats(session.id, challenge.id),
    }))
  );

  if (activeChallenges.length === 0) {
    return (
      <>
        <HomeClientWrapper
          showWelcome={showWelcome}
          showCelebration={false}
          showMissedYesterday={false}
          streak={0}
          policeReportIds={[]}
        />
        <div className="px-4 pb-6 pt-6">
          <AppPageTitle>Home</AppPageTitle>
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <Target className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-slate-900">Aún no tienes retos</h1>
            <p className="mb-8 max-w-sm text-slate-600">
              Crea tu primer reto o únete a uno existente para comenzar tu camino de crecimiento
              personal.
            </p>
            <ChallengeActionModal
              defaultOpen={showWelcome}
              trigger={<Button size="lg">Comenzar</Button>}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HomeClientWrapper
        showWelcome={showWelcome && !focusChallenge}
        showCelebration={focusStats?.showCelebration ?? false}
        showMissedYesterday={focusStats?.showMissedYesterdayModal ?? false}
        streak={focusStats?.streak ?? 0}
        policeReportIds={policeReportIds}
      />
      <div className="px-4 pb-6 pt-6">
        <AppPageTitle>Home</AppPageTitle>

        {focusChallenge && focusStats && (
          <section className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Reto principal
            </h2>
            <HomeChallengeCard
              challenge={focusChallenge}
              stats={focusStats}
              isFocus
            />
          </section>
        )}

        {secondaryWithStats.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Retos secundarios
            </h2>
            <div className="space-y-8">
              {secondaryWithStats.map(
                ({ challenge, stats }) =>
                  stats && (
                    <HomeChallengeCard key={challenge.id} challenge={challenge} stats={stats} />
                  )
              )}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
