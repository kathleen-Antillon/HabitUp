"use client";

import { Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { joinChallengeAction } from "@/actions/challenges";
import { markUserOnboarded } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { focusRingClass } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";

type Props = {
  trigger: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  markOnboardedOnClose?: boolean;
};

type ActiveOption = "create" | "join";

const boxBase =
  "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 text-center transition-colors duration-200 min-[540px]:aspect-square min-[540px]:min-h-[240px] min-[540px]:p-6";

const createBoxBase = "min-h-[132px] min-[540px]:min-h-[240px]";

function boxStyles(active: boolean) {
  return cn(
    boxBase,
    active
      ? "border-[#E07A5F]/35 bg-[#E07A5F]/8"
      : "border-slate-200 bg-slate-50"
  );
}

function iconStyles(active: boolean, compact = false) {
  return cn(
    "flex items-center justify-center rounded-2xl transition-colors duration-200",
    compact ? "h-12 w-12 min-[540px]:h-16 min-[540px]:w-16" : "h-16 w-16",
    active ? "bg-[#E07A5F] text-white" : "bg-slate-200 text-slate-700"
  );
}

function labelStyles(active: boolean, compact = false) {
  return cn(
    "whitespace-nowrap font-semibold transition-colors duration-200",
    compact ? "text-sm min-[540px]:text-base" : "text-base",
    active ? "text-[#334155]" : "text-slate-900"
  );
}

export function ChallengeActionModal({
  trigger,
  defaultOpen = false,
  onOpenChange,
  markOnboardedOnClose = false,
}: Props) {
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
    onOpenChange?.(value);
    if (!value && markOnboardedOnClose) {
      markUserOnboarded();
    }
  }

  function handleCreate() {
    setActiveOption("create");
    handleOpenChange(false);
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

    handleOpenChange(false);
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
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-3xl gap-4 p-5 sm:gap-6 sm:p-8 md:p-10">
        <DialogHeader>
          <DialogTitle className="text-center text-xl min-[540px]:text-2xl">
            Añade un nuevo reto
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-5 min-[540px]:grid-cols-2">
          <button
            type="button"
            onClick={handleCreate}
            onFocus={() => setActiveOption("create")}
            onMouseEnter={() => setActiveOption("create")}
            className={cn(
              boxStyles(isCreateActive),
              createBoxBase,
              isCreateActive &&
                cn(
                  "hover:border-[#E07A5F]/50 hover:bg-[#E07A5F]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  focusRingClass
                )
            )}
          >
            <div className={iconStyles(isCreateActive, true)}>
              <Plus className="h-6 w-6 min-[540px]:h-8 min-[540px]:w-8" strokeWidth={2.5} />
            </div>
            <span className={labelStyles(isCreateActive, true)}>Crear nuevo reto</span>
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
