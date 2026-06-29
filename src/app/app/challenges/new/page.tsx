"use client";

import { useState } from "react";
import { createChallengeAction } from "@/actions/challenges";
import { ChallengeTypeSelector } from "@/components/app/challenge-type-selector";
import { DateRangePicker } from "@/components/app/date-range-picker";
import { InviteParticipantsField } from "@/components/app/invite-participants-field";
import { primaryButtonClass } from "@/components/landing/auth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

function FormSection({
  title,
  description,
  children,
  bordered = false,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  bordered?: boolean;
}) {
  return (
    <section
      className={
        bordered
          ? "border-t border-slate-200 px-6 pb-7 pt-8"
          : "px-6 pb-7 pt-6"
      }
    >
      <div className="mb-7">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export default function NewChallengePage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [challengeType, setChallengeType] = useState<string | null>(null);
  const [dailyGoals, setDailyGoals] = useState<string[]>([""]);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function addGoal() {
    setDailyGoals([...dailyGoals, ""]);
  }

  function removeGoal(index: number) {
    setDailyGoals(dailyGoals.filter((_, i) => i !== index));
  }

  function updateGoal(index: number, value: string) {
    const updated = [...dailyGoals];
    updated[index] = value;
    setDailyGoals(updated);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!challengeType) {
      setError("Selecciona un tipo de reto.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Selecciona las fechas de inicio y fin.");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("type", challengeType);
    formData.set("dailyGoals", JSON.stringify(dailyGoals.filter((g) => g.trim())));
    formData.set("invitedUsers", JSON.stringify(invitedUsers.filter((v) => v.trim())));

    const result = await createChallengeAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      if (result.redirectTo) {
        window.location.assign(result.redirectTo);
      }
      return;
    }
  }

  return (
    <div className="app-page py-6">
      <h1 className="mb-6 text-xl font-bold text-slate-900">Crear nuevo reto</h1>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
      >
        <FormSection
          title="Información del reto"
          description="Define cómo se llama, de qué trata y cuándo se realizará."
        >
          <div>
            <Label htmlFor="name">Nombre del reto</Label>
            <Input
              id="name"
              name="name"
              required
              className="mt-2"
              placeholder="Ej: 30 días de running"
            />
          </div>

          <ChallengeTypeSelector value={challengeType} onChange={setChallengeType} />

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              required
              className="mt-2"
              placeholder="Describe tu reto..."
            />
          </div>

          <div>
            <Label>Fechas del reto</Label>
            <div className="mt-2">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
              />
            </div>
          </div>

          {startDate && endDate && (
            <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
              El reto comienza el <strong>{formatDate(startDate)}</strong> y finaliza el{" "}
              <strong>{formatDate(endDate)}</strong>.
            </div>
          )}
        </FormSection>

        <FormSection
          title="Objetivos del reto"
          description="Establece la meta principal y, si quieres, los objetivos diarios a cumplir."
          bordered
        >
          <div>
            <Label htmlFor="mainGoal">Objetivo principal</Label>
            <Input
              id="mainGoal"
              name="mainGoal"
              required
              className="mt-2"
              placeholder="Ej: Correr 5km diarios"
            />
          </div>

          <div>
            <Label>Objetivos diarios (opcional)</Label>
            <div className="mt-3 space-y-3">
              {dailyGoals.map((goal, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={goal}
                    onChange={(e) => updateGoal(i, e.target.value)}
                    placeholder={`Objetivo ${i + 1}`}
                  />
                  {dailyGoals.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeGoal(i)}>
                      <Trash2 className="h-4 w-4 text-slate-400" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addGoal}>
                <Plus className="mr-1 h-4 w-4" /> Añadir objetivo
              </Button>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Invitar participantes"
          description="Invita a usuarios con cuenta existente. Deberán aceptar la solicitud para unirse al reto."
          bordered
        >
          <InviteParticipantsField invites={invitedUsers} onChange={setInvitedUsers} />
        </FormSection>

        <div className="space-y-4 border-t border-slate-200 px-6 pb-7 pt-8">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className={`w-full ${primaryButtonClass}`} disabled={loading}>
            {loading ? "Creando reto..." : "Crear reto"}
          </Button>
        </div>
      </form>
    </div>
  );
}
