import { CalendarCheck, Users } from "lucide-react";
import Link from "next/link";
import { CHALLENGE_TYPE_OPTIONS } from "@/lib/challenge-types";
import Image from "next/image";
import { Logo } from "./auth-buttons";
import { cn } from "@/lib/utils";

import { BRAND } from "@/lib/brand-colors";

const C = BRAND;

const sections = [
  {
    icon: Users,
    title: "Retos en equipo o individuales",
    description:
      "Crea retos en equipo o individuales para sacar la mejor versión de ti. Compite contigo mismo o crece junto a otros.",
    variant: "team-individual" as const,
    iconWrap: "bg-[#E07A5F]/15",
    iconColor: "text-[#E07A5F]",
  },
  {
    icon: CHALLENGE_TYPE_OPTIONS[0].icon,
    title: "Tipos de retos",
    description: "Elige el enfoque que mejor se adapte a tu meta personal.",
    items: CHALLENGE_TYPE_OPTIONS.map(({ icon, label, color, iconClassName }) => ({
      icon,
      label,
      color,
      iconClassName,
    })),
    variant: "challenge-types" as const,
    iconWrap: "bg-[#64748B]/12",
    iconColor: "text-[#64748B]",
  },
  {
    icon: CalendarCheck,
    title: "Objetivos diarios y seguimiento",
    description:
      "Gestiona objetivos por día en cada reto y trackea tu desarrollo. Marca si cumpliste el día de hoy o no, y mantén tu racha viva.",
    variant: "daily-goals" as const,
    iconWrap: "bg-[#94A98F]/20",
    iconColor: "text-[#94A98F]",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="mx-auto max-w-6xl px-6 py-6">
        <Logo />
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full opacity-40 blur-3xl"
            style={{ backgroundColor: `${C.growth}66` }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-16 top-24 h-56 w-56 rounded-full opacity-35 blur-3xl"
            style={{ backgroundColor: `${C.optimism}80` }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-6 py-20 text-center">
            <div className="mx-auto max-w-3xl">
              <span
                className="mb-4 inline-block rounded-full border px-4 py-1.5 text-sm font-medium"
                style={{
                  backgroundColor: `${C.growth}26`,
                  borderColor: `${C.growth}55`,
                  color: C.discipline,
                }}
              >
                Crecimiento personal, un día a la vez
              </span>
              <h1
                className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
                style={{ color: C.discipline }}
              >
                Alcanza tu mejor versión con retos que{" "}
                <span style={{ color: C.action }}>realmente importan</span>
              </h1>
              <p className="mb-10 text-lg" style={{ color: C.serenity }}>
                Crea retos individuales o en equipo, define objetivos diarios y mide tu progreso
                día a día.
              </p>
              <LandingAuthButtons className="justify-center" />
            </div>
          </div>
        </section>

        {/* Feature sections */}
        {sections.map((section, i) => (
          <section
            key={section.title}
            style={{ backgroundColor: i % 2 === 1 ? C.clarity : "white" }}
          >
            <div className="mx-auto max-w-6xl px-6 py-16">
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div
                    className={cn(
                      "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl",
                      section.iconWrap
                    )}
                  >
                    <section.icon className={cn("h-7 w-7", section.iconColor)} />
                  </div>
                  <h2
                    className="mb-4 text-3xl font-bold"
                    style={{ color: C.discipline }}
                  >
                    {section.title}
                  </h2>
                  <p className="mb-6 text-lg" style={{ color: C.serenity }}>
                    {section.description}
                  </p>
                  {section.items && (
                    <div className="grid grid-cols-2 gap-3">
                      {section.items.map((item) => (
                        <div
                          key={item.label}
                          className={`flex items-center gap-3 rounded-xl p-4 ${item.color}`}
                        >
                          <item.icon
                            className={item.iconClassName ?? "h-5 w-5 shrink-0"}
                          />
                          <span className="min-w-0 font-medium">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <SectionVisual variant={section.variant} />
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <div
            className="relative overflow-hidden rounded-3xl px-8 py-16 text-white"
            style={{ backgroundColor: C.discipline }}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-2xl"
              style={{ backgroundColor: C.optimism }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-8 left-1/4 h-32 w-32 rounded-full opacity-15 blur-2xl"
              style={{ backgroundColor: C.action }}
              aria-hidden
            />
            <h2 className="relative mb-4 text-3xl font-bold sm:text-4xl">
              No esperes más para alcanzar tu mejor versión
            </h2>
            <p className="relative mx-auto mb-8 max-w-xl" style={{ color: `${C.clarity}CC` }}>
              Únete a HabitUp hoy y comienza tu primer reto. Solo necesitas unos minutos para
              empezar.
            </p>
            <div className="relative flex flex-wrap justify-center gap-3">
              <LinkButton href="/login" variant="secondary">
                Iniciar sesión
              </LinkButton>
              <LinkButton
                href="/register"
                variant="outline"
                className="border-current bg-[#F4C97A]/15 text-white hover:bg-[#F4C97A]/25"
              >
                Crear cuenta
              </LinkButton>
            </div>
          </div>
        </section>
      </main>

      <footer
        className="border-t py-8 text-center text-sm"
        style={{ borderColor: `${C.serenity}33`, color: C.serenity }}
      >
        © {new Date().getFullYear()} HabitUp. Todos los derechos reservados.
      </footer>
    </div>
  );
}

function LandingAuthButtons({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Link
        href="/login"
        className="inline-flex h-11 items-center justify-center rounded-full border border-current bg-white px-5 text-sm font-semibold shadow-sm transition-all duration-200 ease-out hover:bg-[#F8FAFC] hover:shadow-md active:scale-[0.98]"
        style={{ color: C.discipline }}
      >
        Iniciar sesión
      </Link>
      <Link
        href="/register"
        className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:brightness-95 hover:shadow-md active:scale-[0.98]"
        style={{ backgroundColor: C.action }}
      >
        Crear cuenta
      </Link>
    </div>
  );
}

function SectionVisual({
  variant,
}: {
  variant: "team-individual" | "challenge-types" | "daily-goals";
}) {
  if (variant === "team-individual") {
    return (
      <div className="grid grid-cols-2 gap-4">
        <figure className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-md">
          <Image
            src="/landing/team-group.jpg"
            alt="Grupo de personas participando en un reto en equipo"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 45vw, 320px"
          />
          <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
            En equipo
          </figcaption>
        </figure>
        <figure className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-md">
          <Image
            src="/landing/individual-phone.jpg"
            alt="Persona completando un reto individual desde su celular"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 45vw, 320px"
          />
          <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
            Individual
          </figcaption>
        </figure>
      </div>
    );
  }

  if (variant === "challenge-types") {
    return (
      <div className="grid h-[min(420px,70vw)] grid-cols-2 grid-rows-2 gap-3">
        <figure className="relative row-span-2 overflow-hidden rounded-3xl shadow-md">
          <Image
            src="/landing/food.jpg"
            alt="Retos alimenticios con comida saludable"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 45vw, 320px"
          />
          <figcaption className="absolute bottom-3 left-3 rounded-full bg-orange-100/95 px-3 py-1 text-xs font-semibold text-orange-800 shadow-sm">
            Alimenticio
          </figcaption>
        </figure>
        <figure className="relative overflow-hidden rounded-3xl shadow-md">
          <Image
            src="/landing/gym.png"
            alt="Retos deportivos en el gimnasio"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 45vw, 320px"
          />
          <figcaption className="absolute bottom-3 left-3 rounded-full bg-blue-100/95 px-3 py-1 text-xs font-semibold text-blue-800 shadow-sm">
            Deportivo
          </figcaption>
        </figure>
        <figure className="relative overflow-hidden rounded-3xl shadow-md">
          <Image
            src="/landing/books.jpg"
            alt="Retos intelectuales con libros"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 45vw, 320px"
          />
          <figcaption className="absolute bottom-3 left-3 rounded-full bg-purple-100/95 px-3 py-1 text-xs font-semibold text-purple-800 shadow-sm">
            Intelectual
          </figcaption>
        </figure>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl border bg-white p-8 shadow-sm"
      style={{ borderColor: `${C.serenity}33` }}
    >
      <div className="space-y-4">
        <div className="h-4 w-3/4 rounded-lg" style={{ backgroundColor: `${C.growth}55` }} />
        <div className="h-4 w-1/2 rounded-lg" style={{ backgroundColor: `${C.optimism}66` }} />
        <div className="mt-6 grid grid-cols-7 gap-2">
          {Array.from({ length: 14 }).map((_, j) => (
            <div
              key={j}
              className="aspect-square rounded-lg"
              style={{
                backgroundColor: j < 9 ? C.growth : C.clarity,
                border: j >= 9 ? `1px solid ${C.serenity}33` : undefined,
              }}
            />
          ))}
        </div>
        <p className="text-center text-sm" style={{ color: C.serenity }}>
          Marca tus objetivos cumplidos cada día
        </p>
      </div>
    </div>
  );
}

function LinkButton({
  href,
  children,
  variant,
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "secondary" | "outline";
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full border border-current px-5 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.98]",
        variant === "secondary"
          ? "bg-white text-[#334155] shadow-sm hover:bg-[#F8FAFC] hover:shadow-md active:shadow-sm"
          : "text-[#334155] shadow-sm hover:shadow-md active:shadow-sm",
        className
      )}
    >
      {children}
    </a>
  );
}
