"use client";

import type { TailoredCV } from "@/lib/schemas";
import { CVDocument } from "./CVDocument";

// Garde-fou : le modèle glisse parfois des tirets longs (— ou –) ; on les
// ramène au trait d'union dans tout le contenu généré avant rendu/téléchargement.
function noDash<T>(value: T): T {
  if (typeof value === "string")
    return value.replace(/[—–]/g, "-") as T;
  if (Array.isArray(value)) return value.map((v) => noDash(v)) as unknown as T;
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, noDash(v)]),
    ) as T;
  return value;
}

function renderHtml(cv: TailoredCV, avatarUrl: string): string {
  const xp = cv.experiences
    .map(
      (e) =>
        `<div class="row"><strong>${e.role}, ${e.company}</strong><span class="period">${e.period}</span></div><ul>${e.bullets
          .map((b) => `<li>${b}</li>`)
          .join("")}</ul>`,
    )
    .join("");
  const edu = cv.education
    .map(
      (e) =>
        `<div class="row"><span>${e.title}, ${e.school}</span><span class="period">${e.year}</span></div>`,
    )
    .join("");
  const certs = cv.certifications.length
    ? `<h2>Certifications</h2><ul>${cv.certifications.map((c) => `<li>${c}</li>`).join("")}</ul>`
    : "";
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${cv.name} CV</title>
<style>:root{--ink:#1c2733;--muted:#54616e;--accent:#1f4e6b;--rule:#c9d2da}
*{box-sizing:border-box}body{font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--ink);font-size:10.5pt;line-height:1.55;max-width:820px;margin:24px auto;padding:0 18px}
header{display:grid;grid-template-columns:auto 1fr;gap:18pt;align-items:center;border-bottom:2px solid var(--accent);padding-bottom:14pt}
.photo{width:78px;height:96px;object-fit:cover;border-radius:4px;border:1px solid var(--rule);filter:grayscale(1)}
h1{margin:0;font-size:18pt}.role{margin:2pt 0 0;color:var(--accent);font-weight:600;font-size:11pt}.contact{margin:6pt 0 0;color:var(--muted);font-size:9pt}
h2{font-size:9.5pt;text-transform:uppercase;letter-spacing:1.6px;color:var(--accent);border-bottom:1px solid var(--rule);padding-bottom:3pt;margin:16pt 0 7pt}
ul{list-style:none;margin:4pt 0 0;padding:0}li{position:relative;padding-left:13pt;margin-bottom:2.5pt}li::before{content:"";position:absolute;left:0;top:.5em;width:4pt;height:4pt;border-radius:50%;background:var(--accent)}
.row{display:flex;justify-content:space-between;gap:12pt}.period{color:var(--muted);font-size:9pt;white-space:nowrap}
.skills{display:flex;flex-wrap:wrap;gap:5pt 6pt}.skill{border:1px solid var(--rule);border-radius:3px;padding:2pt 6pt;font-size:9pt;color:var(--muted)}</style></head>
<body><header>${avatarUrl ? `<img class="photo" src="${avatarUrl}" alt="">` : ""}<div><h1>${cv.name}</h1><p class="role">${cv.title}</p><p class="contact">${cv.contact.email} · ${cv.contact.city} · ${cv.contact.linkedin}</p></div></header>
<h2>Profil</h2><p>${cv.summary}</p>
<h2>Expérience</h2>${xp}
<h2>Formation</h2>${edu}
<h2>Compétences</h2><div class="skills">${cv.highlightedSkills.map((s) => `<span class="skill">${s}</span>`).join("")}</div>
${certs}
<h2>Langues</h2><p>${cv.languages.join(" · ")}</p></body></html>`;
}

export function GeneratedCV({
  cv: raw,
  personaId,
}: {
  cv: TailoredCV;
  personaId: string;
}) {
  const cv = noDash(raw);
  function download() {
    const avatarUrl = `${window.location.origin}/visuels/avatar-${personaId}.jpg`;
    const blob = new Blob([renderHtml(cv, avatarUrl)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CV-${cv.name.replace(/[^\p{L}\p{N}]+/gu, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
          Optimisé pour : {cv.tailoredFor}
        </span>
        <button
          type="button"
          onClick={download}
          className="rounded-xl border border-accent px-3 py-1.5 text-xs font-semibold text-accent-strong transition hover:bg-accent-soft"
        >
          ↓ Télécharger (HTML)
        </button>
      </div>

      <CVDocument
        doc={{
          name: cv.name,
          title: cv.title,
          contact: cv.contact,
          summary: cv.summary,
          experiences: cv.experiences,
          education: cv.education,
          skills: cv.highlightedSkills,
          languages: cv.languages,
          certifications: cv.certifications,
        }}
        avatarSrc={`/visuels/avatar-${personaId}.jpg`}
      />

      {cv.missingForOffer.length > 0 && (
        <div className="rounded-xl border border-dashed border-score-mid/40 bg-score-mid-soft p-3">
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
