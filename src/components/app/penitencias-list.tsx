"use client";

import { useTransition, useState } from "react";
import { completePenitenciaAction } from "@/actions/penitencias";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PenitenciaView } from "@/lib/penitencias";
import {
  getPenitenciaGeneratorLabel,
  getPenitenciaTypeLabel,
} from "@/lib/penitencias";
import { cn } from "@/lib/utils";
import { PartyPopper } from "lucide-react";

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
    month: "long",
    year: "numeric",
  });
}

function PenitenciaCard({ penitencia }: { penitencia: PenitenciaView }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isPending = penitencia.status === "PENDING";

  function handleComplete() {
    setMessage(null);
    startTransition(async () => {
      const result = await completePenitenciaAction(penitencia.id);
      if (result.error) {
        setMessage(result.error);
      }
    });
  }

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm",
        isPending ? "border-amber-200" : "border-slate-200"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{penitencia.challenge.name}</p>
          <p className="text-sm text-slate-500">{getPenitenciaTypeLabel(penitencia.type)}</p>
        </div>
        <Badge variant={isPending ? "destructive" : "secondary"}>
          {isPending ? "Pendiente" : "Cumplida"}
        </Badge>
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Recibida el</dt>
          <dd className="font-medium text-slate-900">{formatDateTime(penitencia.createdAt)}</dd>
        </div>
        {penitencia.incidentDate && (
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Día del incidente</dt>
            <dd className="font-medium text-slate-900">
              {formatDateLabel(penitencia.incidentDate)}
            </dd>
          </div>
        )}
        <div>
          <dt className="mb-1 text-slate-500">Motivo</dt>
          <dd className="rounded-lg bg-slate-50 px-3 py-2 text-slate-900">{penitencia.reason}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Generada por</dt>
          <dd className="font-medium text-slate-900">
            {getPenitenciaGeneratorLabel(penitencia.type, penitencia.generatedBy)}
          </dd>
        </div>
        {penitencia.amount != null && (
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Cargo</dt>
            <dd className="font-semibold text-red-600">{penitencia.amount} dólares</dd>
          </div>
        )}
        {penitencia.completedAt && (
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Cumplida el</dt>
            <dd className="font-medium text-slate-900">
              {formatDateTime(penitencia.completedAt)}
            </dd>
          </div>
        )}
      </dl>

      {message && (
        <p className="mt-3 text-sm text-red-600">{message}</p>
      )}

      {isPending && (
        <Button
          className="mt-4 w-full"
          disabled={pending}
          onClick={handleComplete}
        >
          {pending ? "Guardando..." : "Cumplir penitencia"}
        </Button>
      )}
    </article>
  );
}

export function PenitenciasList({ penitencias }: { penitencias: PenitenciaView[] }) {
  if (penitencias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <PartyPopper className="h-8 w-8 text-amber-600" />
        </div>
        <p className="text-lg font-semibold text-slate-900">Sin penitencias</p>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          Aquí aparecerán los castigos y cargos que recibas por incumplir objetivos o reportes
          confirmados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {penitencias.map((penitencia) => (
        <PenitenciaCard key={penitencia.id} penitencia={penitencia} />
      ))}
    </div>
  );
}
