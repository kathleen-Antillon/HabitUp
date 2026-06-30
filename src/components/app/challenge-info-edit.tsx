"use client";

import { CalendarRange, Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { updateChallengeAction } from "@/actions/challenges";
import { DateRangePicker } from "@/components/app/date-range-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RejoinButton } from "@/components/app/rejoin-button";
import { outlineButtonClass, primaryButtonClass } from "@/components/landing/auth-buttons";
import { challengeDateToInput } from "@/lib/timezone";
import { Input } from "@/components/ui/input";

type ChallengeFields = {
  name: string;
  description: string;
  mainGoal: string;
  startDate: Date | string;
  endDate: Date | string;
};

type Props = {
  challengeId: string;
  challenge: ChallengeFields;
  isLeft: boolean;
  inviteCode: string;
  onFieldsChange: (fields: ChallengeFields) => void;
  onCancel: () => void;
  onSaved: () => void;
};

export function ChallengeInfoEdit({
  challengeId,
  challenge,
  isLeft,
  inviteCode,
  onFieldsChange,
  onCancel,
  onSaved,
}: Props) {
  const router = useRouter();
  const originalStartDate = useRef(challengeDateToInput(challenge.startDate)).current;
  const [mainGoal, setMainGoal] = useState(challenge.mainGoal);
  const [startDate, setStartDate] = useState(challengeDateToInput(challenge.startDate));
  const [endDate, setEndDate] = useState(challengeDateToInput(challenge.endDate));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMainGoal(challenge.mainGoal);
    setStartDate(challengeDateToInput(challenge.startDate));
    setEndDate(challengeDateToInput(challenge.endDate));
  }, [challenge.mainGoal, challenge.startDate, challenge.endDate]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const result = await updateChallengeAction(challengeId, {
      name: challenge.name,
      description: challenge.description,
      mainGoal,
      startDate,
      endDate,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setMessage(result.success ?? "Reto actualizado.");
      onFieldsChange({
        ...challenge,
        mainGoal,
        startDate,
        endDate,
      });
      router.refresh();
      onSaved();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Editar reto</h2>
        <p className="mt-1 text-sm text-slate-500">Modifica la información de tu reto.</p>
      </div>

      <div className="rounded-xl bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-800 shadow-sm">
            <Flag className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <Label htmlFor="mainGoal" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Objetivo
            </Label>
            <Textarea
              id="mainGoal"
              value={mainGoal}
              onChange={(e) => setMainGoal(e.target.value)}
              required
              rows={2}
              className="mt-1.5 resize-none border-slate-200 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
            <CalendarRange className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Duración
            </Label>
            <div className="mt-1.5">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                minStartDate={originalStartDate}
                label="Editar duración del reto"
                onChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-slate-700">{message}</p>}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className={`flex-1 ${outlineButtonClass}`}
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className={`flex-1 ${primaryButtonClass}`}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </div>

      {isLeft && <RejoinButton inviteCode={inviteCode} />}
    </form>
  );
}

type HeaderEditProps = {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

export function ChallengeHeaderEdit({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: HeaderEditProps) {
  return (
    <div className="min-w-0 flex-1 space-y-2">
      <div>
        <Label htmlFor="challenge-name" className="sr-only">
          Nombre del reto
        </Label>
        <Input
          id="challenge-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
          className="border-slate-200 text-lg font-bold text-slate-900"
        />
      </div>
      <div>
        <Label htmlFor="challenge-description" className="sr-only">
          Descripción
        </Label>
        <Textarea
          id="challenge-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          required
          rows={2}
          className="resize-none border-slate-200 text-sm text-slate-600"
        />
      </div>
    </div>
  );
}
