"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const ChallengeActionModal = dynamic(
  () => import("./challenge-action-modal").then((m) => m.ChallengeActionModal),
  { ssr: false }
);

export function EmptyHomeActions({
  showWelcome,
}: {
  showWelcome: boolean;
}) {
  return (
    <ChallengeActionModal
      defaultOpen={showWelcome}
      markOnboardedOnClose={showWelcome}
      trigger={<Button size="lg">Comenzar</Button>}
    />
  );
}
