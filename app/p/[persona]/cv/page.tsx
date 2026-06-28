import Link from "next/link";
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
            <h1 className="text-2xl font-bold tracking-tight">CV d’origine</h1>
            <p className="mt-1 text-sm text-muted">
              Le CV de base du profil, sans adaptation à une offre. Format{" "}
              {cv.pages === 1 ? "1 page" : "2 pages"}, lisible ATS.
            </p>
          </div>
          <Link
            href={`/p/${personaId}/coach`}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            Générer un CV ciblé pour comparer
          </Link>
        </div>

        <div className="mt-3 rounded-xl border border-dashed border-border bg-surface px-4 py-2 text-sm text-muted">
          CV brut, non optimisé pour une offre. Le coach en produit une version
          ciblée pour l’offre choisie : comparez l’accroche, l’ordre des
          compétences et les expériences remontées.
        </div>

        <div className="mt-5">
          <CVPreview cv={cv} personaId={personaId} />
        </div>
      </main>
    </>
  );
}
