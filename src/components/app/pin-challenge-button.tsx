"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setFocusChallengeAction } from "@/actions/challenges";
import { cn } from "@/lib/utils";

export function PinChallengeButton({
  challengeId,
  className,
}: {
  challengeId: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePin() {
    setLoading(true);
    const result = await setFocusChallengeAction(challengeId);
    setLoading(false);
    if (!result?.error) {
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handlePin}
      disabled={loading}
      className={cn(
        "text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 disabled:opacity-50",
        className
      )}
    >
      {loading ? "Convirtiendo..." : "Convertir en reto principal"}
    </button>
  );
}
