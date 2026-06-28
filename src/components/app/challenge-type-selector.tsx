"use client";

import { CHALLENGE_TYPE_OPTIONS } from "@/lib/challenge-types";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
};

export function ChallengeTypeSelector({ value, onChange }: Props) {
  function handleSelect(typeValue: string) {
    if (value === typeValue) {
      onChange(null);
      return;
    }
    onChange(typeValue);
  }

  return (
    <div>
      <Label>Tipo de reto</Label>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CHALLENGE_TYPE_OPTIONS.map((type) => {
          const isSelected = value === type.value;
          const isDisabled = value !== null && !isSelected;

          return (
            <button
              key={type.value}
              type="button"
              disabled={isDisabled}
              onClick={() => handleSelect(type.value)}
              className={cn(
                "flex items-center gap-3 rounded-xl p-4 font-medium transition-all",
                type.color,
                isSelected && cn("ring-2 ring-offset-2", type.ring),
                isDisabled && "cursor-not-allowed opacity-40 saturate-50"
              )}
            >
              <type.icon className="h-5 w-5 shrink-0" />
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>
      {!value && (
        <p className="mt-2 text-xs text-slate-500">Selecciona un tipo de reto para continuar.</p>
      )}
    </div>
  );
}
