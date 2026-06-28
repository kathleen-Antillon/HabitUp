import { Apple, Brain, Dumbbell, Target, type LucideIcon } from "lucide-react";

export type ChallengeTypeValue = "ALIMENTICIO" | "DEPORTIVO" | "INTELECTUAL" | "OTRO";

export type ChallengeTypeConfig = {
  value: ChallengeTypeValue;
  label: string;
  icon: LucideIcon;
  color: string;
  ring: string;
};

export const CHALLENGE_TYPE_OPTIONS: readonly ChallengeTypeConfig[] = [
  {
    value: "ALIMENTICIO",
    label: "Alimenticio",
    icon: Apple,
    color: "bg-orange-100 text-orange-700",
    ring: "ring-orange-400",
  },
  {
    value: "DEPORTIVO",
    label: "Deportivo",
    icon: Dumbbell,
    color: "bg-blue-100 text-blue-700",
    ring: "ring-blue-400",
  },
  {
    value: "INTELECTUAL",
    label: "Intelectual",
    icon: Brain,
    color: "bg-purple-100 text-purple-700",
    ring: "ring-purple-400",
  },
  {
    value: "OTRO",
    label: "Personalizado",
    icon: Target,
    color: "bg-emerald-100 text-emerald-700",
    ring: "ring-emerald-400",
  },
] as const;

export const CHALLENGE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  CHALLENGE_TYPE_OPTIONS.map((option) => [option.value, option.label])
);

export function getChallengeTypeConfig(type: string): ChallengeTypeConfig {
  return (
    CHALLENGE_TYPE_OPTIONS.find((option) => option.value === type) ??
    CHALLENGE_TYPE_OPTIONS.find((option) => option.value === "OTRO")!
  );
}
