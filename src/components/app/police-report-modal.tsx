"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const storageKey = (reportId: string) => `habitup-police-modal-${reportId}`;

export function PoliceReportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-8 w-8 text-blue-700" strokeWidth={2.25} />
        </div>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Noooo la politziaaaa</DialogTitle>
          <DialogDescription className="text-center text-base text-slate-600">
            Te han visto no cumplir con un objetivo, tu caso entrará en debate pronto.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={onClose} className="w-full">
          Entendido
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function PoliceReportModalGate({ reportIds }: { reportIds: string[] }) {
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const unseen = reportIds.find((id) => !localStorage.getItem(storageKey(id)));
    setActiveReportId(unseen ?? null);
  }, [reportIds]);

  function handleClose() {
    if (!activeReportId) return;
    localStorage.setItem(storageKey(activeReportId), "1");
    const remaining = reportIds.find(
      (id) => id !== activeReportId && !localStorage.getItem(storageKey(id))
    );
    setActiveReportId(remaining ?? null);
  }

  return (
    <PoliceReportModal
      open={activeReportId !== null}
      onClose={handleClose}
    />
  );
}
