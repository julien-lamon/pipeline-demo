import { scoreLevel } from "@/lib/data";

const LEVEL_STYLES = {
  high: "bg-score-high-soft text-score-high",
  mid: "bg-score-mid-soft text-score-mid",
  low: "bg-score-low-soft text-score-low",
} as const;

export function ScoreBadge({ score }: { score: number }) {
  const level = scoreLevel(score);
  return (
    <div
      className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${LEVEL_STYLES[level]}`}
      title={`Score ${score}/100`}
    >
      <span className="text-xl font-bold leading-none tabular-nums">{score}</span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide opacity-70">
        score
      </span>
    </div>
  );
}
