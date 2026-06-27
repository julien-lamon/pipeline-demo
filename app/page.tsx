import { PersonaCard } from "@/components/PersonaCard";
import { SiteHeader } from "@/components/SiteHeader";
import { personas } from "@/lib/data";

const FUNNEL = [
  {
    n: "1",
    title: "Veille scorée",
    desc: "Les offres du secteur, triées par pertinence et notées sur 100.",
  },
  {
    n: "2",
    title: "Coaching ciblé",
    desc: "Un coach analyse l’offre choisie et prépare votre candidature.",
  },
  {
    n: "3",
    title: "CV cible",
    desc: "Un CV taillé pour l’intitulé visé, prêt à envoyer.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:py-14">
        <section className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
            Démo · données 100% fictives
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            De la veille d’offres au CV taillé pour le poste.
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted">
            Pipeline trie les offres par pertinence, vous coache sur celle qui
            compte, puis adapte votre CV à l’intitulé visé. Choisissez un profil
            pour parcourir la démo, sans inscription.
          </p>
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          {FUNNEL.map((step) => (
            <div
              key={step.n}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-bold text-white">
                {step.n}
              </span>
              <p className="mt-3 font-semibold">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {step.desc}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Choisissez un profil à incarner
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {personas.map((p) => (
              <PersonaCard key={p.id} persona={p} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
