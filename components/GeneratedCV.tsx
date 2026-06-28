"use client";

import type { TailoredCV } from "@/lib/schemas";

function renderHtml(cv: TailoredCV): string {
  const xp = cv.experiences
    .map(
      (e) =>
        `<section><h3>${e.role} — ${e.company} <span>${e.period}</span></h3><ul>${e.bullets
          .map((b) => `<li>${b}</li>`)
          .join("")}</ul></section>`,
    )
    .join("");
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${cv.title}</title>
<style>body{font-family:Inter,Arial,sans-serif;max-width:760px;margin:2rem auto;color:#18181b;line-height:1.5}
h1{margin:0}h2{color:#d8401b;font-size:.8rem;text-transform:uppercase;letter-spacing:.05em;margin:1.4rem 0 .4rem}
section h3 span{float:right;color:#6b7280;font-weight:400}ul{margin:.2rem 0 .8rem 1.1rem}.badge{display:inline-block;background:#fff1ec;color:#d8401b;padding:.2rem .6rem;border-radius:999px;font-size:.75rem;font-weight:600}</style></head>
<body><div class="badge">Taillé pour : ${cv.tailoredFor}</div><h1>${cv.title}</h1>
<h2>Profil</h2><p>${cv.summary}</p>
<h2>Compétences</h2><p>${cv.highlightedSkills.join(" · ")}</p>
<h2>Expérience</h2>${xp}
${cv.missingForOffer.length ? `<h2>À acquérir pour cette offre</h2><ul>${cv.missingForOffer.map((m) => `<li>${m}</li>`).join("")}</ul>` : ""}
</body></html>`;
}

export function GeneratedCV({ cv }: { cv: TailoredCV }) {
  function download() {
    const blob = new Blob([renderHtml(cv)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CV-cible-${cv.tailoredFor.replace(/[^\p{L}\p{N}]+/gu, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 text-sm leading-relaxed shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
          <span aria-hidden>✂</span> Taillé pour : {cv.tailoredFor}
        </span>
        <button
          type="button"
          onClick={download}
          className="rounded-xl border border-accent px-3 py-1.5 text-xs font-semibold text-accent-strong transition hover:bg-accent-soft"
        >
          ↓ Télécharger (HTML)
        </button>
      </div>

      <h3 className="mt-4 text-xl font-bold">{cv.title}</h3>

      <Section title="Profil">
        <p className="text-foreground/80">{cv.summary}</p>
      </Section>

      <Section title="Compétences priorisées">
        <div className="flex flex-wrap gap-1.5">
          {cv.highlightedSkills.map((s) => (
            <span
              key={s}
              className="rounded-md bg-surface px-2 py-0.5 text-xs text-foreground/80"
            >
              {s}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Expérience">
        <div className="space-y-4">
          {cv.experiences.map((xp) => (
            <div key={`${xp.company}-${xp.period}`}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-semibold">
                  {xp.role} · {xp.company}
                </p>
                <p className="shrink-0 text-xs text-muted">{xp.period}</p>
              </div>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-foreground/80">
                {xp.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {cv.missingForOffer.length > 0 && (
        <div className="mt-5 rounded-xl border border-dashed border-score-mid/40 bg-score-mid-soft p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-score-mid">
            Ce que l’offre demande et que le profil n’a pas
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-foreground/80">
            {cv.missingForOffer.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted">
            Le coach le signale au lieu de l’inventer (règle d’intégrité du CV).
          </p>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-accent-strong">
        {title}
      </h4>
      {children}
    </section>
  );
}
