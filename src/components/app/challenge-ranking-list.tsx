import { cn } from "@/lib/utils";

type RankingMember = {
  userId: string;
  username: string;
  completedDays: number;
  memberStatus: string;
};

function RankingRow({
  member,
  currentUserId,
  position,
}: {
  member: RankingMember;
  currentUserId: string;
  position?: number;
}) {
  const isAbandoned = member.memberStatus === "LEFT";
  const isPendingJoin = member.memberStatus === "PENDING_JOIN";

  return (
    <li
      className={cn(
        "flex min-w-0 items-center justify-between gap-3 rounded-xl px-3 py-3 sm:px-4",
        isAbandoned
          ? "bg-red-50"
          : isPendingJoin
            ? "border border-dashed border-amber-200 bg-amber-50"
            : "bg-slate-50"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            isAbandoned
              ? "bg-red-100 text-red-700"
              : isPendingJoin
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
          )}
        >
          {isPendingJoin ? "…" : position ?? "—"}
        </span>
        <span className="min-w-0 truncate font-medium text-slate-900">
          {member.username}
          {member.userId === currentUserId && (
            <span className="ml-1 text-xs text-slate-500">(tú)</span>
          )}
        </span>
      </div>
      {isAbandoned ? (
        <span className="shrink-0 text-right text-xs font-semibold text-red-600 sm:text-sm">
          Loser por abandono
        </span>
      ) : isPendingJoin ? (
        <span className="shrink-0 text-right text-xs font-semibold text-amber-700 sm:text-sm">
          Pendiente por unirse
        </span>
      ) : (
        <span className="shrink-0 text-sm font-semibold text-emerald-600">
          {member.completedDays} días
        </span>
      )}
    </li>
  );
}

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

  const activeRanking = ranking.filter((member) => member.memberStatus === "ACTIVE");
  const pendingRanking = ranking.filter((member) => member.memberStatus === "PENDING_JOIN");
  const abandonedRanking = ranking.filter((member) => member.memberStatus === "LEFT");

  return (
    <div className="space-y-6">
      {(activeRanking.length > 0 || pendingRanking.length > 0) && (
        <ol className="space-y-2">
          {activeRanking.map((member, index) => (
            <RankingRow
              key={member.userId}
              member={member}
              currentUserId={currentUserId}
              position={index + 1}
            />
          ))}
          {pendingRanking.map((member) => (
            <RankingRow
              key={member.userId}
              member={member}
              currentUserId={currentUserId}
            />
          ))}
        </ol>
      )}

      {abandonedRanking.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Abandonaron el reto
          </h3>
          <ol className="space-y-2">
            {abandonedRanking.map((member) => (
              <RankingRow
                key={member.userId}
                member={member}
                currentUserId={currentUserId}
              />
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
