import Link from "next/link";
import { notFound } from "next/navigation";
import { LogoMark } from "@/components/LogoMark";
import { BelowThresholdFlag, PriorityFlag } from "@/components/Markers";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SiteHeader } from "@/components/SiteHeader";
import { Tag } from "@/components/Tag";
import { getOffer, getPersona, isBelowThreshold, isPriority } from "@/lib/data";

const PISTE_LABEL: Record<string, string> = {
  A: "Piste A, court terme",
  B: "Piste B, positionnement",
};

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ persona: string; offerId: string }>;
}) {
  const { persona: personaId, offerId } = await params;
  const persona = getPersona(personaId);
  const offer = getOffer(personaId, offerId);
  if (!persona || !offer) notFound();

  const priority = isPriority(offer);
  const below = isBelowThreshold(offer);
  const d = offer.description;

  return (
    <>
      <SiteHeader persona={persona} activeStep="offres" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link
          href={`/p/${personaId}/offres`}
          className="text-sm text-muted transition hover:text-foreground"
        >
          ← Toutes les offres
        </Link>

        <header className="mt-4 flex items-start gap-4">
          <LogoMark name={offer.company} size="lg" />
          <div className="min-w-0 flex-1">
            {(priority || below) && (
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                {priority && <PriorityFlag />}
                {below && <BelowThresholdFlag />}
              </div>
            )}
            <h1 className="text-2xl font-bold tracking-tight">{offer.title}</h1>
            <p className="mt-0.5 text-muted">
              {offer.company} · {offer.location}
            </p>
          </div>
          <ScoreBadge score={offer.score} />
        </header>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Tag>{offer.contract}</Tag>
          <Tag>{offer.remote}</Tag>
          {offer.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>

        {/* CTA principal remonté : action visible dès le premier écran */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={`/p/${personaId}/coach?offer=${offer.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-lg font-bold text-white transition hover:bg-accent-strong"
          >
            Coacher pour ce poste →
          </Link>
          <span className="text-sm text-muted">
            Analyse, CV et lettre générés en direct.
          </span>
        </div>

        {/* Axe ATS (proximité) — séparé des lignes rouges, qui sont du ressort du coach */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent-strong">
            Score ATS et positionnement
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <Metric label="Proximité ATS" value={`${offer.score}/100`} />
            <Metric
              label="Positionnement sur l’offre"
              value={offer.positionnement}
            />
            <Metric
              label="Piste"
              value={PISTE_LABEL[offer.piste] ?? offer.piste}
            />
          </dl>
          <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted">
            Le score ATS mesure la proximité sémantique offre/profil (couverture
            des compétences exigées). Le positionnement est la solidité du dossier
            sur 5 niveaux, calibrée sur le marché : ce n’est pas une prédiction de
            réponse. Les lignes rouges (présentiel, rémunération, niveau, diplôme)
            n’entrent dans aucun des deux : c’est le coach qui les signale.
          </p>
          {offer.atsMatch.covered.length > 0 && (
            <KeywordRow label="Couvert" tone="ok" items={offer.atsMatch.covered} />
          )}
          {offer.atsMatch.missing.length > 0 && (
            <KeywordRow
              label="Manquant"
              tone="muted"
              items={offer.atsMatch.missing}
            />
          )}
        </section>

        {/* L'annonce intégrale — c'est ce que lit le coach */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent-strong">
            L’annonce
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">
            {d.context}
          </p>
          <AdList title="Missions" items={d.missions} />
          <AdList title="Profil recherché" items={d.profile} />
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Compétences et outils attendus
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {d.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-foreground/80"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <Field label="Diplôme requis" value={d.diploma} />
            <Field label="Rémunération" value={d.salary} />
          </div>
          <Field label="Conditions" value={d.conditions} />
        </section>

        <div className="mt-6">
          <Link
            href={`/p/${personaId}/coach?offer=${offer.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-base font-semibold text-white transition hover:bg-accent-strong"
          >
            Coacher pour ce poste →
          </Link>
        </div>
      </main>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function KeywordRow({
  label,
  tone,
  items,
}: {
  label: string;
  tone: "ok" | "muted";
  items: string[];
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {items.map((it) => (
        <span
          key={it}
          className={`rounded-md px-2 py-0.5 text-xs ${
            tone === "ok"
              ? "bg-score-high-soft text-score-high"
              : "border border-border text-muted"
          }`}
        >
          {it}
        </span>
      ))}
    </div>
  );
}

function AdList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-foreground/80">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 sm:mt-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground/80">{value}</p>
    </div>
  );
}
