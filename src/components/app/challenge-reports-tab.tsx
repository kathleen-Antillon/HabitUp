"use client";

import { useState, useTransition } from "react";
import { resolveAtrapadoReportAction } from "@/actions/challenges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GoalReportView } from "@/lib/challenges";
import { cn } from "@/lib/utils";

function formatDateLabel(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  UPHELD: "Confirmado",
  DISMISSED: "Descartado",
};

const resolutionLabels: Record<string, string> = {
  INVALIDATE_DAY: "Día anulado",
  KICK_MEMBER: "Expulsado del reto",
  DISMISS: "Reporte descartado",
};

function statusVariant(status: string): "default" | "secondary" | "destructive" {
  if (status === "PENDING") return "destructive";
  if (status === "UPHELD") return "default";
  return "secondary";
}

export function ChallengeReportsTab({ reports }: { reports: GoalReportView[] }) {
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleResolve(
    reportId: string,
    resolution: "INVALIDATE_DAY" | "KICK_MEMBER" | "DISMISS"
  ) {
    setMessage(null);
    setResolvingId(reportId);

    startTransition(async () => {
      const result = await resolveAtrapadoReportAction(reportId, resolution);
      setResolvingId(null);

      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage(result.success ?? "Reporte resuelto.");
      }
    });
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-base font-semibold text-slate-900">Reportes</h2>
        <p className="text-sm text-slate-500">Aún no hay reportes en este reto.</p>
      </div>
    );
  }

  const pendingCount = reports.filter((r) => r.status === "PENDING").length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">Reportes</h2>
        {pendingCount > 0 && (
          <Badge variant="destructive">{pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}</Badge>
        )}
      </div>

      {message && <p className="mb-4 text-sm text-slate-600">{message}</p>}

      <div className="space-y-4">
        {reports.map((report) => (
          <article
            key={report.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {report.reportedUser.username}
                </p>
                <p className="text-xs text-slate-500">Reportado</p>
              </div>
              <Badge variant={statusVariant(report.status)}>
                {statusLabels[report.status] ?? report.status}
              </Badge>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Reportado por</dt>
                <dd className="font-medium text-slate-900">{report.reporter.username}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Día en cuestión</dt>
                <dd className="font-medium text-slate-900">{formatDateLabel(report.date)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Fecha del reporte</dt>
                <dd className="font-medium text-slate-900">{formatDateTime(report.createdAt)}</dd>
              </div>
              {report.reason && (
                <div>
                  <dt className="mb-1 text-slate-500">Motivo</dt>
                  <dd className="rounded-lg bg-white px-3 py-2 text-slate-900">
                    &ldquo;{report.reason}&rdquo;
                  </dd>
                </div>
              )}
              {report.reportedProgress && (
                <div>
                  <dt className="mb-1 text-slate-500">Objetivos marcados como cumplidos</dt>
                  <dd className="text-slate-900">
                    {report.reportedProgress.completedGoalLabels.length > 0
                      ? report.reportedProgress.completedGoalLabels.join(", ")
                      : "Ninguno registrado"}
                  </dd>
                </div>
              )}
              {report.status !== "PENDING" && report.resolution && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Decisión</dt>
                  <dd className="font-medium text-slate-900">
                    {resolutionLabels[report.resolution] ?? report.resolution}
                  </dd>
                </div>
              )}
              {report.resolvedAt && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Resuelto el</dt>
                  <dd className="font-medium text-slate-900">
                    {formatDateTime(report.resolvedAt)}
                  </dd>
                </div>
              )}
            </dl>

            {report.status === "PENDING" && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending && resolvingId === report.id}
                  onClick={() => handleResolve(report.id, "INVALIDATE_DAY")}
                >
                  Anular día
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={pending && resolvingId === report.id}
                  onClick={() => handleResolve(report.id, "KICK_MEMBER")}
                >
                  Expulsar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(pending && resolvingId === report.id && "opacity-50")}
                  disabled={pending && resolvingId === report.id}
                  onClick={() => handleResolve(report.id, "DISMISS")}
                >
                  Descartar
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
