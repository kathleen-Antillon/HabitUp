"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  acceptJoinRequestAction,
  declineJoinRequestAction,
} from "@/actions/join-requests";
import { Button } from "@/components/ui/button";
import type { PendingJoinRequestView } from "@/lib/join-requests";

export function PendingJoinRequestsBanner({
  requests,
  className = "mb-6 space-y-3",
}: {
  requests: PendingJoinRequestView[];
  className?: string;
}) {
  if (requests.length === 0) return null;

  return (
    <div className={className}>
      {requests.map((request) => (
        <PendingJoinRequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}

function PendingJoinRequestCard({ request }: { request: PendingJoinRequestView }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptJoinRequestAction(request.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      } else {
        router.refresh();
      }
    });
  }

  function handleDecline() {
    setError(null);
    startTransition(async () => {
      const result = await declineJoinRequestAction(request.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <article className="rounded-2xl border border-[#94A98F]/40 bg-[#F8FAFC] p-4">
      <p className="font-semibold text-slate-900">Invitación a un reto</p>
      <p className="mt-1 text-sm text-slate-600">
        <strong>{request.invitedByUsername}</strong> te invitó a unirte a{" "}
        <strong>{request.challengeName}</strong>.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button size="sm" disabled={pending} onClick={handleAccept}>
          {pending ? "Procesando..." : "Aceptar"}
        </Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={handleDecline}>
          Rechazar
        </Button>
      </div>
    </article>
  );
}
