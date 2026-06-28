import { cn } from "@/lib/utils";

type RankingMember = {
  userId: string;
  username: string;
  completedDays: number;
  memberStatus: string;
};

export function ChallengeRankingList({
  ranking,
  currentUserId,
}: {
  ranking: RankingMember[];
  currentUserId: string;
}) {
  if (ranking.length === 0) {
    return <p className="text-sm text-slate-500">Sin participantes</p>;
  }

  return (
    <ol className="space-y-2">
      {ranking.map((member, i) => {
        const isAbandoned = member.memberStatus === "LEFT";
        const isPendingJoin = member.memberStatus === "PENDING_JOIN";
        return (
          <li
            key={member.userId}
            className={cn(
              "flex items-center justify-between rounded-xl px-4 py-3",
              isAbandoned
                ? "bg-red-50"
                : isPendingJoin
                  ? "border border-dashed border-amber-200 bg-amber-50"
                  : "bg-slate-50"
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold",
                  isAbandoned
                    ? "bg-red-100 text-red-700"
                    : isPendingJoin
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                )}
              >
                {isPendingJoin ? "…" : i + 1}
              </span>
              <span className="font-medium text-slate-900">
                {member.username}
                {member.userId === currentUserId && (
                  <span className="ml-1 text-xs text-slate-500">(tú)</span>
                )}
              </span>
            </div>
            {isAbandoned ? (
              <span className="text-sm font-semibold text-red-600">Loser por abandono</span>
            ) : isPendingJoin ? (
              <span className="text-sm font-semibold text-amber-700">Pendiente por unirse</span>
            ) : (
              <span className="text-sm font-semibold text-emerald-600">
                {member.completedDays} días
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
