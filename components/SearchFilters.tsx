// Barre de recherche + filtres purement décoratifs (non fonctionnels — démo).
// Aucun état, aucun handler : ce bloc illustre l'UX sans la câbler.

const FILTERS = [
  "Tous contrats",
  "CDI",
  "Île-de-France",
  "Télétravail",
  "Piste A",
  "Piste B",
];

export function SearchFilters() {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span>Rechercher un intitulé, une entreprise…</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f, i) => (
          <span
            key={f}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              i === 0
                ? "border-accent bg-accent-soft text-accent-strong"
                : "border-border text-muted"
            }`}
          >
            {f}
          </span>
        ))}
        <span className="ml-1 text-[11px] text-muted/70">
          (filtres décoratifs — démo)
        </span>
      </div>
    </div>
  );
}
