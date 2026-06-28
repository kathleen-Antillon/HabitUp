import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserChallenges } from "@/lib/challenges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChallengeActionModal } from "@/components/app/challenge-action-modal";
import { AppPageTitle } from "@/components/app/app-page-title";
import { ChallengeTypeIcon } from "@/components/app/challenge-type-icon";
import { ClearAbandonedChallengesButton } from "@/components/app/clear-abandoned-challenges-button";
import { PendingJoinRequestsBanner } from "@/components/app/pending-join-requests-banner";
import { cn } from "@/lib/utils";
import { getPendingJoinRequestsForUser } from "@/lib/join-requests";
import { Plus } from "lucide-react";

function ChallengeList({
  title,
  challenges,
  currentUserId,
  disabled = false,
  headerAction,
}: {
  title: string;
  challenges: Awaited<ReturnType<typeof getUserChallenges>>;
  currentUserId: string;
  disabled?: boolean;
  headerAction?: React.ReactNode;
}) {
  if (challenges.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
        {headerAction}
      </div>
      <div className="space-y-3">
        {challenges.map((c) => {
          const content = (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-3">
                  <ChallengeTypeIcon
                    type={c.type}
                    size="sm"
                    statusTone={disabled ? "muted" : "type"}
                  />
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "font-semibold",
                        disabled ? "text-slate-400" : "text-slate-900"
                      )}
                    >
                      {c.name}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-sm",
                        disabled ? "text-slate-400" : "text-slate-500"
                      )}
                    >
                      Creado por {c.createdBy.username}
                      {c.createdById === currentUserId && " (tú)"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    c.status === "COMPLETED"
                      ? "success"
                      : c.memberStatus === "LEFT"
                        ? "destructive"
                        : "default"
                  }
                >
                  {c.status === "COMPLETED"
                    ? "Completado"
                    : c.memberStatus === "LEFT"
                      ? "No continuado"
                      : "Activo"}
                </Badge>
              </div>
            </>
          );

          if (disabled) {
            return (
              <div
                key={c.id}
                aria-disabled="true"
                className="block cursor-not-allowed rounded-2xl border border-slate-200 bg-white p-4"
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={c.id}
              href={`/app/challenges/${c.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-200"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default async function ChallengesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [challenges, pendingJoinRequests] = await Promise.all([
    getUserChallenges(session.id),
    getPendingJoinRequestsForUser(session.id),
  ]);

  const active = challenges.filter(
    (c) => c.status === "ACTIVE" && c.memberStatus === "ACTIVE"
  );
  const completed = challenges.filter((c) => c.status === "COMPLETED");
  const abandoned = challenges.filter(
    (c) => c.memberStatus === "LEFT" || c.status === "ABANDONED"
  );

  const hasJoinRequests = pendingJoinRequests.length > 0;
  const isEmpty = challenges.length === 0;

  return (
    <div className="app-page">
      <AppPageTitle>Retos</AppPageTitle>

      {isEmpty ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Plus className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="mb-4 text-slate-600">No tienes retos todavía</p>
          <ChallengeActionModal trigger={<Button>Crear o unirse a un reto</Button>} />
        </div>
      ) : (
        <>
          <ChallengeList title="Activos" challenges={active} currentUserId={session.id} />
          <ChallengeList title="Completados" challenges={completed} currentUserId={session.id} />
          <ChallengeList
            title="No continuados"
            challenges={abandoned}
            currentUserId={session.id}
            disabled
            headerAction={<ClearAbandonedChallengesButton count={abandoned.length} />}
          />
        </>
      )}

      {hasJoinRequests && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Solicitudes para unirse
          </h2>
          <PendingJoinRequestsBanner
            requests={pendingJoinRequests}
            className="space-y-3"
          />
        </section>
      )}
    </div>
  );
}
