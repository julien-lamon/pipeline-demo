import type { RedLineHit } from "@/lib/schemas";

// Encart assumé du « moment seuil » : famille corail (charte), pas un rouge
// d'erreur générique. Le spot illustre la ligne rouge sous laquelle l'offre passe.
export function RedLineCallout({ hits }: { hits: RedLineHit[] }) {
  if (hits.length === 0) return null;
  const plural = hits.length > 1 ? "s" : "";
  return (
    <div className="overflow-hidden rounded-2xl border border-accent/30 bg-accent-soft">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/visuels/spot-ligne-rouge.svg"
        alt=""
        className="w-full border-b border-accent/15"
      />
      <div className="p-4">
        <p className="text-sm font-bold uppercase tracking-wide text-accent-strong">
          Ligne{plural} rouge{plural} heurtée{plural}
        </p>
        <ul className="mt-3 space-y-3">
          {hits.map((h, i) => (
            <li key={i} className="text-sm">
              <p className="font-semibold text-foreground">{h.line}</p>
              <p className="mt-0.5 text-muted">{h.offending}</p>
              <span className="mt-1 inline-block rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-strong ring-1 ring-accent/30">
                {h.severity}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
