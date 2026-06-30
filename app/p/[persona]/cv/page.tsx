import { notFound } from "next/navigation";
import { CVPreview } from "@/components/CVPreview";
import { ExpandableCard } from "@/components/ExpandableCard";
import { ProfilHighlights } from "@/components/ProfilHighlights";
import { SiteHeader } from "@/components/SiteHeader";
import { getCV, getPersona } from "@/lib/data";
import { getProfilDoc, getProfilHighlights } from "@/lib/profil";

export default async function CVPage({
  params,
}: {
  params: Promise<{ persona: string }>;
}) {
  const { persona: personaId } = await params;
  const persona = getPersona(personaId);
  const cv = getCV(personaId);
  if (!persona || !cv) notFound();

  const highlights = getProfilHighlights(personaId);
  const profilDoc = getProfilDoc(personaId);

  return (
    <>
      <SiteHeader persona={persona} activeStep="cv" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CV d’origine</h1>
          <p className="mt-1 text-sm text-muted">
            Le matériau de départ du profil : son CV brut et le profil
            détaillé que lit le coach. Aucune adaptation à une offre, c’est le
            point de départ ; dans le coach, l’étape 2 en produit une version
            ciblée pour l’offre choisie.
          </p>
        </div>

        <div className="mt-6 space-y-8">
          {/* Carte 1 : le CV brut (document formaté), tronqué puis déplié */}
          <ExpandableCard
            title="CV d’origine"
            subtitle="Document formaté, lisible ATS"
            clamp
          >
            <CVPreview cv={cv} personaId={personaId} />
          </ExpandableCard>

          {/* Carte 2 : le document de vérité, highlights puis document complet */}
          {highlights && (
            <ExpandableCard
              title="Profil détaillé du candidat"
              badge="ce que lit le coach"
              subtitle="Attentes, objectifs et lignes rouges"
              preview={<ProfilHighlights data={highlights} />}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Document complet
              </p>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-surface p-3 text-xs leading-relaxed text-foreground/80">
                {profilDoc}
              </pre>
            </ExpandableCard>
          )}
        </div>
      </main>
    </>
  );
}
