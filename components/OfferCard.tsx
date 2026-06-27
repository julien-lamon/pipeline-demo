import Link from "next/link";
import { isBelowThreshold, isPriority } from "@/lib/data";
import type { Offer } from "@/lib/types";
import { LogoMark } from "./LogoMark";
import { BelowThresholdFlag, PriorityFlag } from "./Markers";
import { ScoreBadge } from "./ScoreBadge";
import { Tag } from "./Tag";

export function OfferCard({ offer }: { offer: Offer }) {
  const priority = isPriority(offer);
  const below = isBelowThreshold(offer);
  return (
    <Link
      href={`/p/${offer.personaId}/offres/${offer.id}`}
      className={`group block rounded-2xl border bg-card p-4 transition hover:border-accent/40 hover:shadow-sm ${
        below ? "border-border opacity-80" : "border-border"
      }`}
    >
      <div className="flex items-start gap-4">
        <LogoMark name={offer.company} />
        <div className="min-w-0 flex-1">
          {(priority || below) && (
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              {priority && <PriorityFlag />}
              {below && <BelowThresholdFlag />}
            </div>
          )}
          <h3 className="truncate text-base font-semibold text-foreground transition group-hover:text-accent-strong">
            {offer.title}
          </h3>
          <p className="truncate text-sm text-muted">
            {offer.company} · {offer.location}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Tag>{offer.contract}</Tag>
            <Tag>{offer.remote}</Tag>
            {offer.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
        <ScoreBadge score={offer.score} />
      </div>
    </Link>
  );
}
