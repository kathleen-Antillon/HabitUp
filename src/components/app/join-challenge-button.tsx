"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinChallengeAction } from "@/actions/challenges";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function JoinChallengeButton({
  inviteCode,
  className,
}: {
  inviteCode: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setLoading(true);
    const result = await joinChallengeAction(inviteCode);
    setLoading(false);
    if (result?.redirectTo) {
      router.push(result.redirectTo);
      router.refresh();
    }
  }

  return (
    <Button
      onClick={handleJoin}
      disabled={loading}
      className={cn("w-full", className)}
      size="lg"
    >
      {loading ? "Uniéndose..." : "Unirse al reto"}
    </Button>
  );
}
