import Link from "next/link";
import { notFound } from "next/navigation";
import { LogoMark } from "@/components/LogoMark";
import { BelowThresholdFlag, PriorityFlag } from "@/components/Markers";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SiteHeader } from "@/components/SiteHeader";
import { Tag } from "@/components/Tag";
import {
  getOffer,
  getPersona,
  isBelowThreshold,
  isPriority,
} from "@/lib/data";

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

        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent-strong">
            Score détaillé
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <Metric label="Score global" value={`${offer.score}/100`} />
            <Metric label="Compatibilité ATS" value={`${offer.scoreAts}/100`} />
            <Metric label="Chances d’entretien" value={offer.chancesEntretien} />
          </dl>
          <div className="mt-4 border-t border-border pt-4">
            <Metric label="Piste" value={PISTE_LABEL[offer.piste] ?? offer.piste} />
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              <span className="font-semibold text-foreground">Notes : </span>
              {offer.notes}
            </p>
          </div>
        </section>

        <div className="mt-6">
          <Link
            href={`/p/${personaId}/coach?offer=${offer.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-strong"
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
