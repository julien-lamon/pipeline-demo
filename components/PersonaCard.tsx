import Link from "next/link";
import type { Persona } from "@/lib/types";
import { Avatar } from "./Avatar";

export function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <Link
      href={`/p/${persona.id}/offres`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-accent/40 hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <Avatar id={persona.id} className="h-14 w-14" />
        <div>
          <p className="font-semibold">{persona.name}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            {persona.seniorityLabel}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">
        {persona.title}
      </p>
      <p className="text-sm text-accent-strong">{persona.sector}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
        {persona.pitch}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-strong">
        Incarner ce profil
        <span aria-hidden className="transition group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}
