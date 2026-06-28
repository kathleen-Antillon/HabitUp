"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinChallengeAction } from "@/actions/challenges";
import { Button } from "@/components/ui/button";

export function RejoinButton({ inviteCode }: { inviteCode: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRejoin() {
    setLoading(true);
    const result = await joinChallengeAction(inviteCode);
    setLoading(false);
    if (result?.redirectTo) {
      router.push(result.redirectTo);
      router.refresh();
    }
  }

  return (
    <Button onClick={handleRejoin} disabled={loading} className="mb-4 w-full">
      {loading ? "Uniéndose..." : "Unirse de nuevo al reto"}
    </Button>
  );
}
