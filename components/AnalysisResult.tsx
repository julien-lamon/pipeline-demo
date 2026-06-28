import type { AnalysisResult as Analysis } from "@/lib/schemas";
import { RedLineCallout } from "./RedLineCallout";

const VERDICT_STYLES: Record<string, string> = {
  Foncer: "bg-score-high-soft text-score-high",
  "À tenter": "bg-score-mid-soft text-score-mid",
  Prudence: "bg-score-mid-soft text-score-mid",
  "À éviter": "bg-red-50 text-red-700",
};

export function AnalysisResult({ analysis }: { analysis: Analysis }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${
            VERDICT_STYLES[analysis.verdict] ?? "bg-surface text-foreground"
          }`}
        >
          {analysis.verdict}
        </span>
        <p className="text-sm text-muted">Analyse générée par le coach</p>
      </div>

      <p className="text-foreground/90">{analysis.summary}</p>

      <RedLineCallout hits={analysis.redLines} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Block title="Points forts" items={analysis.fitStrengths} tone="good" />
        <Block title="Écarts à l’offre" items={analysis.gaps} tone="warn" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-accent-strong">
          Recommandation
        </p>
        <p className="mt-1 text-sm text-foreground/90">
          {analysis.recommendation}
        </p>
      </div>
    </div>
  );
}

function Block({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "warn";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">—</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm text-foreground/90">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className={tone === "good" ? "text-score-high" : "text-score-mid"}>
                {tone === "good" ? "✓" : "•"}
              </span>
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
