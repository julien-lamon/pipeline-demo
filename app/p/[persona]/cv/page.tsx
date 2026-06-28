import { notFound } from "next/navigation";
import { CVPreview } from "@/components/CVPreview";
import { SiteHeader } from "@/components/SiteHeader";
import { getCV, getPersona } from "@/lib/data";

export default async function CVPage({
  params,
}: {
  params: Promise<{ persona: string }>;
}) {
  const { persona: personaId } = await params;
  const persona = getPersona(personaId);
  const cv = getCV(personaId);
  if (!persona || !cv) notFound();

  return (
    <>
      <SiteHeader persona={persona} activeStep="cv" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CV cible</h1>
            <p className="mt-1 text-sm text-muted">
              Exemple : en version live, ce CV serait généré pour l’offre choisie.
              Format {cv.pages === 1 ? "1 page" : "2 pages"}, lisible ATS.
            </p>
          </div>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted"
            aria-disabled
            title="Disponible en version live"
          >
            ↓ Télécharger (version live)
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-dashed border-accent/40 bg-accent-soft px-4 py-2 text-sm text-accent-strong">
          Aperçu statique. Aucune génération réelle dans cette démo.
        </div>

        <div className="mt-5">
          <CVPreview cv={cv} />
        </div>
      </main>
    </>
  );
}
