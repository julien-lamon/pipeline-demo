import Link from "next/link";
import { notFound } from "next/navigation";
import { CoachLive } from "@/components/CoachLive";
import { SiteHeader } from "@/components/SiteHeader";
import { getOffer, getPersona } from "@/lib/data";
import { getProfilDoc } from "@/lib/profil";

const STEPS = [
  {
    title: "Analyse de l’offre",
    desc: "Le coach lit l’intitulé, les attendus et les mots-clés ATS de l’offre choisie.",
  },
  {
    title: "Dialogue ciblé",
    desc: "Il croise l’offre avec le document de vérité du profil et pose les bonnes questions.",
  },
  {
    title: "Génération du CV",
    desc: "Il produit un CV taillé pour le poste, prêt à relire et à envoyer.",
  },
];

export default async function CoachPage({
  params,
  searchParams,
}: {
  params: Promise<{ persona: string }>;
  searchParams: Promise<{ offer?: string }>;
}) {
  const { persona: personaId } = await params;
  const { offer: offerId } = await searchParams;
  const persona = getPersona(personaId);
  if (!persona) notFound();

  const offer = offerId ? getOffer(personaId, offerId) : undefined;
  const doc = getProfilDoc(personaId);

  return (
    <>
      <SiteHeader persona={persona} activeStep="coach" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
          Coach live · vrais appels Claude
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          Coaching pour la candidature
        </h1>

        {offer ? (
          <p className="mt-1 text-muted">
            Poste ciblé :{" "}
            <span className="font-semibold text-foreground">{offer.title}</span>{" "}
            chez {offer.company}.
          </p>
        ) : (
          <p className="mt-1 text-muted">
            Choisissez d’abord une offre pour cibler le coaching.
          </p>
        )}

        <ol className="mt-6 space-y-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-bold text-accent-strong">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{step.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">
                  {step.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6">
          <CoachLive
            personaId={persona.id}
            offer={
              offer
                ? { id: offer.id, title: offer.title, company: offer.company }
                : null
            }
          />
        </div>

        {doc && (
          <details className="mt-6 rounded-2xl border border-border bg-card p-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Voir le document de vérité du profil (ce que lirait le coach)
            </summary>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-surface p-3 text-xs leading-relaxed text-foreground/80">
              {doc}
            </pre>
          </details>
        )}

        <div className="mt-6">
          <Link
            href={`/p/${personaId}/cv`}
            className="inline-flex items-center gap-2 rounded-xl border border-accent px-5 py-3 font-semibold text-accent-strong transition hover:bg-accent-soft"
          >
            Voir le CV cible (exemple statique) →
          </Link>
        </div>
      </main>
    </>
  );
}
