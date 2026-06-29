/** HabitUp brand palette — shared across landing and dashboard. */
export const BRAND = {
  discipline: "#334155",
  serenity: "#64748B",
  growth: "#94A98F",
  optimism: "#F4C97A",
  action: "#E07A5F",
  clarity: "#F8FAFC",
} as const;

export const primaryButtonClass =
  "bg-[#E07A5F] text-white shadow-sm hover:brightness-95 hover:shadow-md active:brightness-90 active:shadow-sm";

export const outlineButtonClass =
  "border border-current bg-white text-[#334155] shadow-sm hover:bg-[#F8FAFC] hover:shadow-md active:bg-[#F8FAFC]/80 active:shadow-sm";

export const fabButtonClass =
  "bg-[#E07A5F] text-white shadow-[0_8px_24px_rgba(224,122,95,0.35)] hover:brightness-95 hover:shadow-[0_10px_28px_rgba(224,122,95,0.45)] active:scale-95";

export const navActiveClass =
  "bg-[#334155] text-white shadow-sm hover:brightness-95";

export const tabActiveClass = "bg-[#E07A5F] text-white shadow-sm";

export const focusRingClass = "focus-visible:ring-[#E07A5F]/40";

export const inputFocusRingClass =
  "focus-visible:ring-2 focus-visible:ring-[#E07A5F]/40 focus-visible:ring-offset-2";
