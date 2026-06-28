"use client";

import { useEffect, useState } from "react";
import { markUserOnboarded } from "@/actions/auth";
import { ChallengeActionModal } from "./challenge-action-modal";
import { CelebrationModal } from "./celebration-modal";
import { MissedGoalsModalGate } from "./missed-goals-modal";
import { PoliceReportModalGate } from "./police-report-modal";

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
  const [welcomeOpen, setWelcomeOpen] = useState(showWelcome);
  const [celebrationOpen, setCelebrationOpen] = useState(showCelebration);

  useEffect(() => {
    if (showWelcome) {
      markUserOnboarded();
    }
  }, [showWelcome]);

  return (
    <>
      {welcomeOpen && (
        <ChallengeActionModal
          defaultOpen
          trigger={<span className="hidden" />}
          onClose={() => setWelcomeOpen(false)}
        />
      )}
      <MissedGoalsModalGate show={showMissedYesterday && !welcomeOpen} />
      <PoliceReportModalGate reportIds={policeReportIds} />
      <CelebrationModal
        open={celebrationOpen && !showMissedYesterday}
        onClose={() => setCelebrationOpen(false)}
        streak={streak}
      />
    </>
  );
}
