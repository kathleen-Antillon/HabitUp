"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ChallengeActionModal = dynamic(
  () => import("./challenge-action-modal").then((m) => m.ChallengeActionModal),
  { ssr: false }
);
const CelebrationModal = dynamic(
  () => import("./celebration-modal").then((m) => m.CelebrationModal),
  { ssr: false }
);
const MissedGoalsModalGate = dynamic(
  () => import("./missed-goals-modal").then((m) => m.MissedGoalsModalGate),
  { ssr: false }
);
const PoliceReportModalGate = dynamic(
  () => import("./police-report-modal").then((m) => m.PoliceReportModalGate),
  { ssr: false }
);

export function HomeClientWrapper({
  showWelcome,
  showCelebration,
  showMissedYesterday,
  streak,
  policeReportIds = [],
}: {
  showWelcome: boolean;
  showCelebration: boolean;
  showMissedYesterday: boolean;
  streak: number;
  policeReportIds?: string[];
}) {
  const [mounted, setMounted] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(showCelebration);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCelebrationOpen(showCelebration);
  }, [showCelebration]);

  if (!mounted) return null;

  const welcomeActive = showWelcome && !welcomeDismissed;

  return (
    <>
      {showWelcome && (
        <ChallengeActionModal
          defaultOpen={!welcomeDismissed}
          markOnboardedOnClose
          onOpenChange={(open) => {
            if (!open) setWelcomeDismissed(true);
          }}
          trigger={
            <button type="button" className="sr-only">
              Abrir opciones de reto
            </button>
          }
        />
      )}
      <MissedGoalsModalGate show={showMissedYesterday && !welcomeActive} />
      {!welcomeActive && <PoliceReportModalGate reportIds={policeReportIds} />}
      <CelebrationModal
        open={celebrationOpen && !showMissedYesterday && !welcomeActive}
        onClose={() => setCelebrationOpen(false)}
        streak={streak}
      />
    </>
  );
}
