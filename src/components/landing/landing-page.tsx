import { CalendarCheck, Users } from "lucide-react";
import { CHALLENGE_TYPE_OPTIONS } from "@/lib/challenge-types";
import Image from "next/image";
import { AuthButtons } from "./auth-buttons";
import { Logo } from "./auth-buttons";

const sections = [
  {
    icon: Users,
    title: "Retos en equipo o individuales",
    description:
      "Crea retos en equipo o individuales para sacar la mejor versión de ti. Compite contigo mismo o crece junto a otros.",
    variant: "team-individual" as const,
  },
  {
    icon: CHALLENGE_TYPE_OPTIONS[0].icon,
    title: "Tipos de retos",
    description: "Elige el enfoque que mejor se adapte a tu meta personal.",
    items: CHALLENGE_TYPE_OPTIONS.map(({ icon, label, color }) => ({ icon, label, color })),
    variant: "challenge-types" as const,
  },
  {
    icon: CalendarCheck,
    title: "Objetivos diarios y seguimiento",
    description:
      "Gestiona objetivos por día en cada reto y trackea tu desarrollo. Marca si cumpliste el día de hoy o no, y mantén tu racha viva.",
    variant: "daily-goals" as const,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <header className="mx-auto max-w-6xl px-6 py-6">
        <Logo />
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <span className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-800">
              Crecimiento personal, un día a la vez
            </span>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Alcanza tu mejor versión con retos que{" "}
              <span className="text-emerald-600">realmente importan</span>
            </h1>
            <p className="mb-10 text-lg text-slate-600">
              Crea retos individuales o en equipo, define objetivos diarios y mide tu progreso
              día a día.
            </p>
            <AuthButtons className="justify-center" />
          </div>
        </section>

        {/* Feature sections */}
        {sections.map((section, i) => (
          <section
            key={section.title}
            className={i % 2 === 1 ? "bg-slate-50" : "bg-transparent"}
          >
            <div className="mx-auto max-w-6xl px-6 py-16">
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                    <section.icon className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h2 className="mb-4 text-3xl font-bold text-slate-900">{section.title}</h2>
                  <p className="mb-6 text-lg text-slate-600">{section.description}</p>
                  {section.items && (
                    <div className="grid grid-cols-2 gap-3">
                      {section.items.map((item) => (
                        <div
                          key={item.label}
                          className={`flex items-center gap-3 rounded-xl p-4 ${item.color}`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
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
          <div className="rounded-3xl bg-emerald-600 px-8 py-16 text-white">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              No esperes más para alcanzar tu mejor versión
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-emerald-100">
              Únete a HabitUp hoy y comienza tu primer reto. Solo necesitas unos minutos para
              empezar.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <LinkButton href="/login" variant="secondary">
                Iniciar sesión
              </LinkButton>
              <LinkButton href="/register" variant="outline" className="border-white bg-white/10 text-white hover:bg-white/20">
                Crear cuenta
              </LinkButton>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} HabitUp. Todos los derechos reservados.
      </footer>
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
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-4">
        <div className="h-4 w-3/4 rounded-lg bg-emerald-100" />
        <div className="h-4 w-1/2 rounded-lg bg-slate-100" />
        <div className="mt-6 grid grid-cols-7 gap-2">
          {Array.from({ length: 14 }).map((_, j) => (
            <div
              key={j}
              className={`aspect-square rounded-lg ${j < 9 ? "bg-emerald-200" : "bg-slate-100"}`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-slate-500">
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
      className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors ${
        variant === "secondary"
          ? "bg-white text-emerald-700 hover:bg-emerald-50"
          : "border border-white/30 hover:bg-white/10"
      } ${className ?? ""}`}
    >
      {children}
    </a>
  );
}
