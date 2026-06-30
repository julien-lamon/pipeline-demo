import Image from "next/image";
import { PersonaCard } from "@/components/PersonaCard";
import { SiteHeader } from "@/components/SiteHeader";
import { personas } from "@/lib/data";

const STEPS = [
  {
    n: "1",
    title: "Veille scorée",
    desc: "Les offres du secteur, triées par pertinence.",
  },
  {
    n: "2",
    title: "CV d’origine",
    desc: "Le CV et le profil de base, avec ses objectifs pro.",
  },
  {
    n: "3",
    title: "Coaching ciblé",
    desc: "Le coach analyse l’offre et génère le CV optimisé.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:py-14">
        {/* Hero : split asymétrique, illustration à droite, beaucoup de blanc */}
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
              Profils fictifs · lancez l’IA pour tester en direct
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              De la veille d’offres au CV optimisé pour le poste.
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
              <span className="font-semibold text-accent-strong">Pipeline</span>{" "}
              trie les offres d’emploi par pertinence, vous coache sur celles qui
              comptent, puis adapte votre CV et votre lettre de motivation au
              poste visé. Vous n’avez plus qu’à relire et valider.
            </p>
          </div>
          <Image
            src="/visuels/hero-offres.jpg"
            alt="Une personne sélectionne une offre pertinente dans une liste de candidatures"
            width={1240}
            height={827}
            priority
            className="h-auto w-full rounded-2xl"
          />
        </section>

        {/* Parcours : bande process numérotée (séquence réelle, pas des cartes) */}
        <section className="mt-14">
          <div className="grid divide-y divide-border rounded-2xl border border-border bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {STEPS.map((step) => (
              <div key={step.n} className="flex items-start gap-3 p-5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                  {step.n}
                </span>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sélection persona : vraies illustrations (1 par profil) */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">
            Choisissez un profil à incarner
          </h2>
          <p className="mt-2 max-w-3xl leading-relaxed text-muted">
            Chaque profil vous fait vivre le parcours complet et voir comment{" "}
            <span className="font-semibold text-accent-strong">Pipeline</span>{" "}
            facilite la candidature : de la sélection des offres d’emploi à
            l’optimisation du CV en fonction de l’offre, jusqu’à la rédaction de
            la lettre de motivation.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {personas.map((p) => (
              <PersonaCard key={p.id} persona={p} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
