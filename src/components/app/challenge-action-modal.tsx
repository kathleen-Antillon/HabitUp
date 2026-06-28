"use client";

import { Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { joinChallengeAction } from "@/actions/challenges";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  trigger: React.ReactNode;
  defaultOpen?: boolean;
  onClose?: () => void;
};

type ActiveOption = "create" | "join";

const boxBase =
  "flex aspect-square min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6 text-center transition-colors duration-200 min-[540px]:min-h-[240px]";

function boxStyles(active: boolean) {
  return cn(
    boxBase,
    active
      ? "border-emerald-200 bg-emerald-50"
      : "border-slate-200 bg-slate-50"
  );
}

function iconStyles(active: boolean) {
  return cn(
    "flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-200",
    active ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
  );
}

function labelStyles(active: boolean) {
  return cn(
    "whitespace-nowrap text-base font-semibold transition-colors duration-200",
    active ? "text-emerald-900" : "text-slate-900"
  );
}

export function ChallengeActionModal({ trigger, defaultOpen = false, onClose }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [activeOption, setActiveOption] = useState<ActiveOption>("create");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveOption("create");
      setInviteCode("");
      setError("");
    }
  }, [open]);

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) onClose?.();
  }

  function handleCreate() {
    setActiveOption("create");
    setOpen(false);
    router.push("/app/challenges/new");
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setActiveOption("join");
    setLoading(true);
    setError("");
    const code = inviteCode.trim().split("/").pop()?.split("?")[0] ?? "";
    const result = await joinChallengeAction(code);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setOpen(false);
    onClose?.();
    setLoading(false);
    if (result?.redirectTo) {
      router.push(result.redirectTo);
      router.refresh();
    }
  }

  const isCreateActive = activeOption === "create";
  const isJoinActive = activeOption === "join";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-3xl gap-6 p-8 sm:p-10">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Comienza con un reto ahora</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-5 min-[540px]:grid-cols-2">
          <button
            type="button"
            onClick={handleCreate}
            onFocus={() => setActiveOption("create")}
            onMouseEnter={() => setActiveOption("create")}
            className={cn(
              boxStyles(isCreateActive),
              isCreateActive &&
                "hover:border-emerald-400 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            )}
          >
            <div className={iconStyles(isCreateActive)}>
              <Plus className="h-8 w-8" strokeWidth={2.5} />
            </div>
            <span className={labelStyles(isCreateActive)}>Crear nuevo reto</span>
          </button>

          <div
            className={boxStyles(isJoinActive)}
            onFocusCapture={() => setActiveOption("join")}
            onMouseEnter={() => setActiveOption("join")}
            onClick={() => setActiveOption("join")}
          >
            <div className={iconStyles(isJoinActive)}>
              <Users className="h-8 w-8" strokeWidth={2} />
            </div>
            <span className={labelStyles(isJoinActive)}>Unirse a un reto existente</span>
            <form onSubmit={handleJoin} className="mt-1 w-full space-y-2.5">
              <Input
                id="inviteCode"
                placeholder="Código o link"
                value={inviteCode}
                onChange={(e) => {
                  setActiveOption("join");
                  setInviteCode(e.target.value);
                }}
                onFocus={() => setActiveOption("join")}
                className="h-10 text-sm"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <Button
                type="submit"
                variant={isJoinActive ? "default" : "outline"}
                className="w-full"
                disabled={loading || !inviteCode.trim()}
                onFocus={() => setActiveOption("join")}
              >
                {loading ? "Uniéndose..." : "Unirse"}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
