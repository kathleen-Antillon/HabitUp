"use client";

import { useEffect, useState } from "react";
import { Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ChallengeShareButton({ inviteCode }: { inviteCode: string }) {
  const [open, setOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [joinLink, setJoinLink] = useState(`/join/${inviteCode}`);

  useEffect(() => {
    setJoinLink(`${window.location.origin}/join/${inviteCode}`);
  }, [inviteCode]);

  async function copyLink() {
    await navigator.clipboard.writeText(joinLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  async function copyCode() {
    await navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 rounded-xl"
        >
          Compartir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compartir reto</DialogTitle>
          <DialogDescription>
            Invita a otros a unirse con el link o el código del reto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-medium text-slate-900">Link de invitación</p>
            </div>
            <p className="mb-3 break-all rounded-lg bg-white px-3 py-2 text-xs text-slate-600">
              {joinLink}
            </p>
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={copyLink}>
              <Copy className="mr-2 h-4 w-4" />
              {copiedLink ? "¡Link copiado!" : "Copiar link"}
            </Button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Copy className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-medium text-slate-900">Código de invitación</p>
            </div>
            <p className="mb-3 rounded-lg bg-white px-3 py-2 text-center font-mono text-lg font-semibold tracking-widest text-slate-900">
              {inviteCode}
            </p>
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={copyCode}>
              <Copy className="mr-2 h-4 w-4" />
              {copiedCode ? "¡Código copiado!" : "Copiar código"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
