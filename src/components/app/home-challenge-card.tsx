import Link from "next/link";
import { Check, Clock } from "lucide-react";
import { ChallengeTypeIcon } from "@/components/app/challenge-type-icon";
import { Button } from "@/components/ui/button";
import { outlineButtonClass } from "@/components/landing/auth-buttons";
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

const actionButtonClass =
  "h-auto min-h-11 min-w-0 flex-1 whitespace-normal px-2 py-2.5 text-center text-xs leading-tight sm:px-3 sm:text-sm";

function StatusBadge({ isComplete }: { isComplete: boolean }) {
  if (isComplete) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 sm:h-9 sm:w-9">
        <Check className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" strokeWidth={3} aria-hidden />
      </span>
    );
  }

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 sm:h-9 sm:w-9">
      <Clock className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" strokeWidth={2.5} aria-hidden />
    </span>
  );
}

function ChallengeHeader({
  challenge,
  isFocus,
  isComplete,
}: {
  challenge: Props["challenge"];
  isFocus: boolean;
  isComplete: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
      <ChallengeTypeIcon type={challenge.type} size="lg" statusTone="type" />
      <div className="min-w-0 flex-1">
        <h2 className="break-words text-base font-bold leading-tight text-slate-900 sm:text-lg">
          {challenge.name}
        </h2>
        {isFocus ? (
          <p className="mt-0.5 break-words text-sm leading-snug text-slate-500">
            {challenge.description}
          </p>
        ) : (
          <PinChallengeButton challengeId={challenge.id} className="mt-0.5 text-left" />
        )}
      </div>
      <StatusBadge isComplete={isComplete} />
    </div>
  );
}

function ChallengeActions({
  challengeId,
  isComplete,
}: {
  challengeId: string;
  isComplete: boolean;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className={cn(actionButtonClass, "w-full flex-none font-semibold", outlineButtonClass)}
    >
      <Link href={`/app/challenges/${challengeId}?tab=objetivos&open=1`}>
        {isComplete ? "Editar objetivos" : "Completar objetivos"}
      </Link>
    </Button>
  );
}

function StatsGrid({
  daysRemaining,
  userCompletedDays,
  progressPercent,
}: {
  daysRemaining: number;
  userCompletedDays: number;
  progressPercent: number;
}) {
  return (
    <div className="mb-4 grid min-w-0 grid-cols-3 gap-1 border-y border-slate-100 py-3 text-center sm:mb-5 sm:gap-2 sm:py-4">
      <div className="min-w-0 px-0.5">
        <p className="text-lg font-bold tabular-nums text-slate-900 sm:text-xl">{daysRemaining}</p>
        <p className="mt-0.5 text-[10px] leading-tight text-slate-500 sm:text-xs">Días restantes</p>
      </div>
      <div className="min-w-0 px-0.5">
        <p className="text-lg font-bold tabular-nums text-slate-900 sm:text-xl">
          {userCompletedDays}
        </p>
        <p className="mt-0.5 text-[10px] leading-tight text-slate-500 sm:text-xs">
          Días completados
        </p>
      </div>
      <div className="min-w-0 px-0.5">
        <p className="text-lg font-bold tabular-nums text-slate-900 sm:text-xl">
          {progressPercent}%
        </p>
        <p className="mt-0.5 text-[10px] leading-tight text-slate-500 sm:text-xs">Progreso</p>
      </div>
    </div>
  );
}

export function HomeChallengeCard({ challenge, stats, isFocus = false }: Props) {
  const isComplete = stats.todayProgress?.isComplete ?? false;
  const progressPercent =
    stats.totalDays > 0
      ? Math.round((stats.userCompletedDays / stats.totalDays) * 100)
      : 0;

  if (!isFocus) {
    return (
      <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <ChallengeHeader challenge={challenge} isFocus={false} isComplete={isComplete} />
        <div className="mt-3 border-t border-slate-100 pt-3 sm:mt-4 sm:pt-4">
          <ChallengeActions
            challengeId={challenge.id}
            isComplete={isComplete}
          />
        </div>
      </article>
    );
  }

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl bg-white p-3 shadow-sm sm:p-5">
      <ChallengeHeader challenge={challenge} isFocus isComplete={isComplete} />

      <div className="py-4 text-center sm:py-5">
        <p
          className={cn(
            "text-4xl font-bold tabular-nums sm:text-5xl",
            isComplete ? "text-emerald-700" : "text-orange-500"
          )}
        >
          {stats.currentDay}
        </p>
        <p className="mt-1 text-sm text-slate-500">Día del reto</p>
      </div>

      <StatsGrid
        daysRemaining={stats.daysRemaining}
        userCompletedDays={stats.userCompletedDays}
        progressPercent={progressPercent}
      />

      <ChallengeActions
        challengeId={challenge.id}
        isComplete={isComplete}
      />
    </article>
  );
}
