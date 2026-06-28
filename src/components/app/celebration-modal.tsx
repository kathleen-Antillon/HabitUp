"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CelebrationModal({
  open,
  onClose,
  streak,
}: {
  open: boolean;
  onClose: () => void;
  streak: number;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">🎉 ¡Felicitaciones!</DialogTitle>
          <DialogDescription className="text-center text-base">
            Llevas <strong>{streak} días consecutivos</strong> completando todos tus objetivos.
            ¡Sigue así, tu mejor versión está cada vez más cerca!
          </DialogDescription>
        </DialogHeader>
        <Button onClick={onClose} className="w-full">
          ¡Gracias!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
