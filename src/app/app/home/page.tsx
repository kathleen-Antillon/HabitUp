import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getChallengeStats,
  getFocusChallenge,
  getPendingReportIdsAgainstUser,
  getUserChallenges,
} from "@/lib/challenges";
import { HomeClientWrapper } from "@/components/app/home-client-wrapper";
import { EmptyHomeActions } from "@/components/app/empty-home-actions";
import { PendingJoinRequestsBanner } from "@/components/app/pending-join-requests-banner";
import { HomeChallengeCard } from "@/components/app/home-challenge-card";
import { Plus } from "lucide-react";
import { getPendingJoinRequestsForUser } from "@/lib/join-requests";
import { processMissedGoalsForUser } from "@/lib/missed-goals";
import { linkButtonSemiboldClass } from "@/lib/link-button";
import { cn } from "@/lib/utils";

async function getChallengeWithStats(userId: string, challengeId: string) {
  try {
    const stats = await getChallengeStats(userId, challengeId);
    if (!stats) return null;
    return stats;
  } catch (error) {
    console.error("[home] getChallengeStats failed", challengeId, error);
    return null;
  }
}

async function getSafePoliceReportIds(userId: string, challengeId: string) {
  try {
    return await getPendingReportIdsAgainstUser(userId, challengeId);
  } catch (error) {
    console.error("[home] getPendingReportIdsAgainstUser failed", error);
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { welcome?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  try {
    const pendingJoinRequests = await getPendingJoinRequestsForUser(session.id);
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

    const missedGoals = await processMissedGoalsForUser(session.id);

    const policeReportIds = focusChallenge
      ? await getSafePoliceReportIds(session.id, focusChallenge.id)
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
            showWelcome={false}
            showCelebration={false}
            showMissedYesterday={missedGoals.showMissedModal}
            missedModalDateKey={missedGoals.missedModalDateKey}
            streak={0}
            policeReportIds={[]}
          />
        <div className="app-page pb-8">
          <PendingJoinRequestsBanner requests={pendingJoinRequests} />
          <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <Plus className="h-10 w-10 text-emerald-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-slate-900">Aún no tienes retos</h1>
              <p className="mb-8 max-w-sm text-slate-600">
                Crea tu primer reto o únete a uno existente para comenzar tu camino de crecimiento
                personal.
              </p>
              <EmptyHomeActions showWelcome={showWelcome} />
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
          showMissedYesterday={missedGoals.showMissedModal}
          missedModalDateKey={missedGoals.missedModalDateKey}
          streak={focusStats?.streak ?? 0}
          policeReportIds={policeReportIds}
        />
        <div className="app-page pb-8">
          <PendingJoinRequestsBanner requests={pendingJoinRequests} />

          {focusChallenge && focusStats && (
            <section className="mb-8 min-w-0 overflow-hidden rounded-3xl bg-[#334155] px-3 pb-4 pt-4 sm:px-4 sm:pb-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-300">
                Reto principal
              </h2>
              <HomeChallengeCard
                challenge={focusChallenge}
                stats={focusStats}
                isFocus
              />
            </section>
          )}

          {focusChallenge && !focusStats && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-medium">No se pudo cargar tu reto principal.</p>
              <Link
                href={`/app/challenges/${focusChallenge.id}`}
                className={cn("mt-2 inline-block", linkButtonSemiboldClass)}
              >
                Abrir reto
              </Link>
            </div>
          )}

          {secondaryWithStats.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Retos secundarios
              </h2>
              <div className="space-y-4">
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
  } catch (error) {
    console.error("[home] page render failed", error);
    return (
      <div className="app-page py-10 text-center">
        <p className="text-sm text-slate-600">
          Hubo un problema al cargar tu inicio. Recarga la página o vuelve a iniciar sesión.
        </p>
      </div>
    );
  }
}
