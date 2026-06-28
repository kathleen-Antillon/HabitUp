import Link from "next/link";
import { Check, Clock } from "lucide-react";
import { ChallengeTypeIcon } from "@/components/app/challenge-type-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PinChallengeButton } from "@/components/app/pin-challenge-button";
import type { getChallengeStats } from "@/lib/challenges";

type ChallengeStats = NonNullable<Awaited<ReturnType<typeof getChallengeStats>>>;

type Props = {
  challenge: {
    id: string;
    name: string;
    description: string;
    type: string;
  };
  stats: ChallengeStats;
  isFocus?: boolean;
};

export function HomeChallengeCard({ challenge, stats, isFocus = false }: Props) {
  const isComplete = stats.todayProgress?.isComplete;
  const isInProgress = !isComplete;
  const progressPercent =
    stats.totalDays > 0
      ? Math.round((stats.userCompletedDays / stats.totalDays) * 100)
      : 0;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <ChallengeTypeIcon
          type={challenge.type}
          size="lg"
          statusTone={isComplete ? "type" : "pending"}
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold leading-tight text-slate-900">{challenge.name}</h2>
          {isFocus ? (
            <p className="mt-1 text-sm leading-snug text-slate-500">{challenge.description}</p>
          ) : (
            <PinChallengeButton challengeId={challenge.id} className="mt-1 text-left" />
          )}
        </div>
        {isComplete && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600">
            <Check className="h-4 w-4 text-white" strokeWidth={3} aria-hidden />
          </span>
        )}
        {isInProgress && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500">
            <Clock className="h-4 w-4 text-white" strokeWidth={2.5} aria-hidden />
          </span>
        )}
      </div>

      <div className="my-4 border-t border-slate-100" />

      <div className="py-2 text-center">
        <p
          className={cn(
            "text-4xl font-bold",
            isComplete ? "text-emerald-600" : "text-amber-600"
          )}
        >
          {stats.currentDay}
        </p>
        <p className="mt-1 text-sm text-slate-500">Día del reto</p>
      </div>

      <div className="my-4 border-t border-slate-100" />

      <div className="grid grid-cols-3 gap-3 pb-4 text-center">
        <div>
          <p className="text-xl font-bold text-slate-900">{stats.daysRemaining}</p>
          <p className="mt-1 text-xs text-slate-500">Días restantes</p>
        </div>
        <div>
          <p className="text-xl font-bold text-slate-900">{stats.userCompletedDays}</p>
          <p className="mt-1 text-xs text-slate-500">Días completados</p>
        </div>
        <div>
          <p className="text-xl font-bold text-slate-900">{progressPercent}%</p>
          <p className="mt-1 text-xs text-slate-500">Progreso</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button asChild variant="outline" className="h-11 flex-1 rounded-xl text-sm">
          <Link href={`/app/challenges/${challenge.id}`}>Gestionar reto</Link>
        </Button>
        <Button asChild className="h-11 flex-1 rounded-xl text-sm">
          <Link href={`/app/challenges/${challenge.id}?tab=objetivos&open=1`}>
            {isComplete ? "Editar objetivos" : "Completar objetivos"}
          </Link>
        </Button>
      </div>
    </article>
  );
}
