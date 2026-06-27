// Marqueurs visuels d'une offre par rapport au seuil de pertinence.

export function PriorityFlag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent-strong">
      <span aria-hidden>★</span> Prioritaire
    </span>
  );
}

export function BelowThresholdFlag() {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
      Sous le seuil
    </span>
  );
}
