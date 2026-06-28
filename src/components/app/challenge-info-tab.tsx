import { CalendarRange, Flag } from "lucide-react";
import { RejoinButton } from "@/components/app/rejoin-button";
import { formatDate } from "@/lib/utils";

type Props = {
  mainGoal: string;
  startDate: Date | string;
  endDate: Date | string;
  isLeft: boolean;
  inviteCode: string;
  onEdit?: () => void;
};

export function ChallengeInfoTab({
  mainGoal,
  startDate,
  endDate,
  isLeft,
  inviteCode,
  onEdit,
}: Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">Información del reto</h2>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
          >
            Editar
          </button>
        )}
      </div>

      <div className="rounded-xl bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
            <Flag className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Objetivo
            </p>
            <p className="mt-1 text-sm font-medium leading-snug text-slate-900">{mainGoal}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
            <CalendarRange className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Duración
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {formatDate(startDate)} — {formatDate(endDate)}
            </p>
          </div>
        </div>
      </div>

      {isLeft && <RejoinButton inviteCode={inviteCode} />}
    </div>
  );
}
