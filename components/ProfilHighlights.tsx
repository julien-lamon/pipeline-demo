import type { ProfilHighlights as Highlights } from "@/lib/profil";

// Aperçu du document de vérité : on ne montre que le « delta » utile que le CV ne
// porte pas (objectifs court/moyen terme + lignes rouges bloquantes). Le document
// intégral est déplié par la carte parente.
export function ProfilHighlights({ data }: { data: Highlights }) {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        Construit via un échange coach/candidat après le dépôt du CV, pour cerner
        ce que le CV ne dit pas : ses objectifs et ses blocages. C’est l’unique
        source que le coach lit pour adapter le CV ; il trie et reformule, il
        n’invente jamais.
      </p>

      {data.objectifs.length > 0 && (
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-accent-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            Objectifs
          </p>
          <dl className="mt-2 space-y-2">
            {data.objectifs.map((o, i) => (
              <div key={i} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                {o.term && (
                  <dt className="shrink-0 text-xs font-bold uppercase tracking-wide text-ink-faint sm:w-28">
                    {o.term}
                  </dt>
                )}
                <dd className="text-sm text-foreground/80">{o.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {data.lignesRouges.length > 0 && (
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-accent-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            Lignes rouges
          </p>
          <ul className="mt-2 space-y-1.5">
            {data.lignesRouges.map((l, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-foreground/80">
                <span
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-[10px] font-bold text-ink-faint"
                  aria-hidden
                >
                  ✕
                </span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
