"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyInviteLink({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${inviteCode}`;

  async function copy() {
    await navigator.clipboard.writeText(link || `/join/${inviteCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="mb-2 text-sm font-medium text-slate-700">Compartir link de invitación</p>
      <p className="mb-3 truncate rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        /join/{inviteCode}
      </p>
      <Button variant="outline" size="sm" onClick={copy}>
        {copied ? "¡Copiado!" : "Copiar link"}
      </Button>
    </div>
  );
}
