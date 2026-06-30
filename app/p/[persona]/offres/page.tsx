import { notFound } from "next/navigation";
import { OfferCard } from "@/components/OfferCard";
import { SearchFilters } from "@/components/SearchFilters";
import { SiteHeader } from "@/components/SiteHeader";
import { getOffers, getPersona } from "@/lib/data";

export default async function OffresPage({
  params,
}: {
  params: Promise<{ persona: string }>;
}) {
  const { persona: personaId } = await params;
  const persona = getPersona(personaId);
  if (!persona) notFound();

  const offers = getOffers(personaId);

  return (
    <>
      <SiteHeader persona={persona} activeStep="offres" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">
            Offres scorées · {persona.sector}
          </h1>
          <p className="mt-1 text-muted">
            {offers.length} offres d’emploi triées par score. Cliquez sur l’une
            d’entre elles pour lancer le coach et voir comment Pipeline aide les
            candidats à y répondre.
          </p>
        </header>

        <div className="mt-5">
          <SearchFilters />
        </div>

        <ScoreLegend />

        <ul className="mt-4 space-y-3">
          {offers.map((offer) => (
            <li key={offer.id}>
              <OfferCard offer={offer} />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

function ScoreLegend() {
  const items = [
    { label: `Prioritaire (≥ ${85})`, dot: "bg-score-high" },
    { label: "Pertinent", dot: "bg-score-mid" },
    { label: "Sous le seuil", dot: "bg-score-low" },
  ];
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${it.dot}`} aria-hidden />
          {it.label}
        </span>
      ))}
    </div>
  );
}
