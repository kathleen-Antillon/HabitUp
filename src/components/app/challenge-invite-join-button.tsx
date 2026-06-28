"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { acceptJoinRequestAction, declineJoinRequestAction } from "@/actions/join-requests";
import { joinChallengeAction } from "@/actions/challenges";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  inviteCode: string;
  pendingJoinRequestId?: string | null;
  className?: string;
};

export function ChallengeInviteJoinButton({
  inviteCode,
  pendingJoinRequestId,
  className,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"join" | "decline" | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isBusy = loading !== null || isPending;

  async function handleJoin() {
    setError("");
    setLoading("join");

    if (pendingJoinRequestId) {
      const result = await acceptJoinRequestAction(pendingJoinRequestId);
      setLoading(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
      router.refresh();
      return;
    }

    const result = await joinChallengeAction(inviteCode);
    setLoading(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.redirectTo) {
      router.push(result.redirectTo);
    }
    router.refresh();
  }

  function handleDecline() {
    setError("");
    setLoading("decline");
    startTransition(async () => {
      if (pendingJoinRequestId) {
        const result = await declineJoinRequestAction(pendingJoinRequestId);
        if (result.error) {
          setError(result.error);
          setLoading(null);
          return;
        }
      }
      router.push("/app/challenges");
      router.refresh();
    });
  }

  return (
    <div className={cn("mt-4 flex flex-col gap-2 sm:flex-row sm:flex-row-reverse", className)}>
      <Button type="button" className="w-full sm:flex-1" disabled={isBusy} onClick={handleJoin}>
        {loading === "join" ? "Uniéndose..." : "Unirse al reto"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full sm:flex-1"
        disabled={isBusy}
        onClick={handleDecline}
      >
        {loading === "decline" ? "Procesando..." : "Rechazar"}
      </Button>
      {error && <p className="w-full text-sm text-red-600 sm:order-first sm:basis-full">{error}</p>}
    </div>
  );
}
