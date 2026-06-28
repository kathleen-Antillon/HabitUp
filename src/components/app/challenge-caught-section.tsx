"use client";

import { useState, useTransition } from "react";
import { Eye } from "lucide-react";
import { submitAtrapadoReportAction } from "@/actions/challenges";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SingleDatePicker } from "@/components/app/single-date-picker";
import { Textarea } from "@/components/ui/textarea";
import { startOfDay, toInputDate } from "@/lib/utils";

type RankingMember = {
  userId: string;
  username: string;
  memberStatus: string;
};

type Props = {
  challengeId: string;
  currentUserId: string;
  isActiveMember: boolean;
  ranking: RankingMember[];
  startDate: Date | string;
  endDate: Date | string;
};

export function ChallengeCaughtSection({
  challengeId,
  currentUserId,
  isActiveMember,
  ranking,
  startDate,
  endDate,
}: Props) {
  const reportableMembers = ranking.filter(
    (m) => m.memberStatus === "ACTIVE" && m.userId !== currentUserId
  );

  const today = startOfDay();
  const yesterday = startOfDay(new Date(today.getTime() - 86400000));
  const challengeStart = startOfDay(startDate);
  const challengeEnd = startOfDay(endDate);
  const maxReportable = challengeEnd < yesterday ? challengeEnd : yesterday;
  const hasReportableDays = maxReportable >= challengeStart;
  const minDate = toInputDate(challengeStart);
  const maxDate = toInputDate(maxReportable);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <Eye className="h-5 w-5 text-amber-700" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Atrapado</h2>
          <p className="mt-1 text-sm text-slate-500">
            ¿Alguien marcó sus objetivos como completados sin haberlos cumplido? Repórtalo y
            luego decidan el castigo.
          </p>
        </div>
      </div>

      {isActiveMember && reportableMembers.length > 0 && hasReportableDays && (
        <ReportForm
          challengeId={challengeId}
          members={reportableMembers}
          minDate={minDate}
          maxDate={maxDate}
        />
      )}

      {isActiveMember && reportableMembers.length > 0 && !hasReportableDays && (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Aún no hay días anteriores disponibles para reportar en este reto.
        </p>
      )}

      {isActiveMember && reportableMembers.length === 0 && (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          No hay otros participantes activos para reportar.
        </p>
      )}

      {!isActiveMember && (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Solo los participantes activos pueden enviar reportes.
        </p>
      )}
    </div>
  );
}

function ReportForm({
  challengeId,
  members,
  minDate,
  maxDate,
}: {
  challengeId: string;
  members: RankingMember[];
  minDate: string;
  maxDate: string;
}) {
  const [reportedUserId, setReportedUserId] = useState(members[0]?.userId ?? "");
  const [date, setDate] = useState(maxDate);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(
    null
  );
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await submitAtrapadoReportAction(
        challengeId,
        reportedUserId,
        date,
        reason
      );

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: result.success ?? "Reporte enviado." });
        setReason("");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4"
    >
      <p className="text-sm font-medium text-amber-900">Reportar participante</p>

      <div className="space-y-2">
        <Label htmlFor="caught-user">Participante</Label>
        <select
          id="caught-user"
          value={reportedUserId}
          onChange={(e) => setReportedUserId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          required
        >
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.username}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-0 space-y-2">
        <Label htmlFor="caught-date">Día en cuestión</Label>
        <SingleDatePicker
          id="caught-date"
          value={date}
          min={minDate}
          max={maxDate}
          onChange={setDate}
          label="Día en cuestión"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="caught-reason">Motivo (opcional)</Label>
        <Textarea
          id="caught-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej: Dijo que corrió 5 km pero no salió de casa..."
          rows={3}
        />
      </div>

      {message && (
        <p
          className={
            message.type === "error"
              ? "text-sm text-red-600"
              : "text-sm text-emerald-600"
          }
        >
          {message.text}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending || !reportedUserId}
        className="w-full bg-amber-900 text-white hover:bg-amber-950"
      >
        {pending ? "Enviando..." : "Enviar reporte"}
      </Button>
    </form>
  );
}
