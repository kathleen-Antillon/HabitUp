"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setFocusChallengeAction } from "@/actions/challenges";
import { cn } from "@/lib/utils";
import { linkButtonClass } from "@/lib/link-button";

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
      className={cn(linkButtonClass, "text-xs", className)}
    >
      {loading ? "Convirtiendo..." : "Convertir en reto principal"}
    </button>
  );
}
