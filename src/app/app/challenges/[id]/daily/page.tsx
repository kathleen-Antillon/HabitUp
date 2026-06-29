import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getChallengeStats } from "@/lib/challenges";
import { DailyGoalsForm } from "@/components/app/daily-goals-form";
import { Button } from "@/components/ui/button";

export default async function DailyGoalsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const stats = await getChallengeStats(session.id, params.id);
  if (!stats) notFound();

  const completedIds: string[] = stats.todayProgress
    ? JSON.parse(stats.todayProgress.completedGoalIds)
    : [];

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="link" size="sm" asChild>
          <Link href="/app/home">← Volver</Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Objetivos de hoy</h1>
          <p className="text-sm text-slate-500">{stats.challenge.name}</p>
        </div>
      </div>

      <DailyGoalsForm
        challengeId={params.id}
        goals={stats.challenge.dailyGoals}
        initialCompleted={completedIds}
      />
    </div>
  );
}
