import { getChallengeTypeConfig } from "@/lib/challenge-types";
import { cn } from "@/lib/utils";

type Props = {
  type: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  statusTone?: "type" | "pending" | "muted";
};

const sizeClasses = {
  sm: { box: "h-8 w-8 rounded-xl", icon: "h-4 w-4" },
  md: { box: "h-10 w-10 rounded-xl", icon: "h-5 w-5" },
  lg: { box: "h-12 w-12 rounded-2xl", icon: "h-6 w-6" },
};

const typeColorClasses: Record<string, string> = {
  ALIMENTICIO: "bg-orange-100 text-orange-700",
  DEPORTIVO: "bg-blue-100 text-blue-700",
  INTELECTUAL: "bg-purple-100 text-purple-700",
  OTRO: "bg-emerald-100 text-emerald-700",
};

const pendingToneClasses = "bg-amber-100 text-amber-700";
const mutedToneClasses = "bg-slate-100 text-slate-500";

/** Icono con colores del tipo de reto (landing / formulario). */
export function ChallengeTypeIcon({
  type,
  size = "md",
  className,
  statusTone = "type",
}: Props) {
  const config = getChallengeTypeConfig(type);
  const Icon = config.icon;
  const sizes = sizeClasses[size];
  const colors =
    statusTone === "pending"
      ? pendingToneClasses
      : statusTone === "muted"
        ? mutedToneClasses
        : typeColorClasses[config.value] ?? typeColorClasses.OTRO;

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center",
        sizes.box,
        colors,
        className
      )}
      aria-hidden
    >
      <Icon className={cn(sizes.icon, "text-current")} />
    </span>
  );
}
