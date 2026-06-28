"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toInputDate } from "@/lib/utils";

const storageKey = () => `habitup-missed-modal-${toInputDate(new Date())}`;

export function MissedGoalsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">😢 Epa moscaaa</DialogTitle>
          <DialogDescription className="text-center text-base text-slate-600">
            Por no cumplir con tus objetivos ayer debes <strong>10 dólares</strong>.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={onClose} className="w-full">
          Entendido
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function MissedGoalsModalGate({ show }: { show: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!show) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(storageKey())) return;
    setOpen(true);
  }, [show]);

  function handleClose() {
    localStorage.setItem(storageKey(), "1");
    setOpen(false);
  }

  return <MissedGoalsModal open={open} onClose={handleClose} />;
}
