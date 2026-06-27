import Link from "next/link";
import type { Persona } from "@/lib/types";

type Step = "offres" | "coach" | "cv";

const STEPS: { key: Step; label: string }[] = [
  { key: "offres", label: "Veille scorée" },
  { key: "coach", label: "Coaching" },
  { key: "cv", label: "CV cible" },
];

export function SiteHeader({
  persona,
  activeStep,
}: {
  persona?: Persona;
  activeStep?: Step;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Brand />
        {persona && (
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm transition hover:border-accent/50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent-strong">
              {persona.initials}
            </span>
            <span className="font-medium">{persona.name}</span>
            <span className="text-muted">· changer</span>
          </Link>
        )}
      </div>
      {persona && activeStep && (
        <FunnelNav personaId={persona.id} active={activeStep} />
      )}
    </header>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent font-bold text-white">
        P
      </span>
      <span className="font-semibold tracking-tight">Pipeline</span>
    </Link>
  );
}

function FunnelNav({ personaId, active }: { personaId: string; active: Step }) {
  const activeIndex = STEPS.findIndex((s) => s.key === active);
  return (
    <nav className="mx-auto max-w-5xl px-4 pb-3" aria-label="Étapes du parcours">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {STEPS.map((step, i) => {
          const state =
            i < activeIndex ? "done" : i === activeIndex ? "active" : "todo";
          return (
            <li key={step.key} className="flex items-center gap-2">
              <Link
                href={`/p/${personaId}/${step.key}`}
                aria-current={state === "active" ? "step" : undefined}
                className={`flex items-center gap-2 rounded-full px-3 py-1 transition ${
                  state === "active"
                    ? "bg-accent text-white"
                    : state === "done"
                      ? "bg-accent-soft text-accent-strong"
                      : "text-muted hover:text-foreground"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                    state === "active"
                      ? "bg-white/25"
                      : state === "done"
                        ? "bg-white text-accent-strong"
                        : "border border-border bg-surface"
                  }`}
                >
                  {i + 1}
                </span>
                {step.label}
              </Link>
              {i < STEPS.length - 1 && (
                <span className="text-border" aria-hidden>
                  —
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
