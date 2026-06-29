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

function storageKey(dateKey: string) {
  return `habitup-missed-modal-${dateKey}`;
}

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

export function MissedGoalsModalGate({
  show,
  dateKey,
}: {
  show: boolean;
  dateKey: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!show || !dateKey) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(storageKey(dateKey))) return;
    setOpen(true);
  }, [show, dateKey]);

  function handleClose() {
    if (dateKey) {
      localStorage.setItem(storageKey(dateKey), "1");
    }
    setOpen(false);
  }

  return <MissedGoalsModal open={open} onClose={handleClose} />;
}
