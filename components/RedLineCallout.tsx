import type { RedLineHit } from "@/lib/schemas";

// Encart ASSUMÉ (pas une erreur grise) : c'est le signal que le coach raisonne
// et ne dit pas oui à tout. Prêt à être stylé plus finement au design.
export function RedLineCallout({ hits }: { hits: RedLineHit[] }) {
  if (hits.length === 0) return null;
  return (
    <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4">
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-red-700">
        <span aria-hidden>⛔</span>
        Ligne{hits.length > 1 ? "s" : ""} rouge{hits.length > 1 ? "s" : ""} heurtée
        {hits.length > 1 ? "s" : ""}
      </p>
      <ul className="mt-3 space-y-3">
        {hits.map((h, i) => (
          <li key={i} className="text-sm">
            <p className="font-semibold text-red-900">{h.line}</p>
            <p className="mt-0.5 text-red-800/80">{h.offending}</p>
            <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-700">
              {h.severity}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
