import type { CV } from "@/lib/types";

export function CVPreview({ cv }: { cv: CV }) {
  return (
    <article className="rounded-2xl border border-border bg-white p-6 text-sm leading-relaxed shadow-sm sm:p-8">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
        <span aria-hidden>✂</span> Taillé pour : {cv.tailoredFor}
      </div>

      <header className="border-b border-border pb-4">
        <h2 className="text-2xl font-bold">{cv.name}</h2>
        <p className="mt-0.5 text-base font-medium text-accent-strong">
          {cv.title}
        </p>
        <p className="mt-2 text-xs text-muted">
          {cv.contact.email} · {cv.contact.city} · {cv.contact.linkedin}
        </p>
      </header>

      <Section title="Profil">
        <p className="text-foreground/80">{cv.summary}</p>
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

      <div className="grid gap-6 sm:grid-cols-2">
        <Section title="Compétences">
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map((s) => (
              <span
                key={s}
                className="rounded-md bg-surface px-2 py-0.5 text-xs text-foreground/80"
              >
                {s}
              </span>
            ))}
          </div>
        </Section>
        <Section title="Langues">
          <p className="text-foreground/80">{cv.languages.join(" · ")}</p>
        </Section>
      </div>

      <Section title="Formation">
        <div className="space-y-1">
          {cv.education.map((e) => (
            <div
              key={`${e.title}-${e.year}`}
              className="flex items-baseline justify-between gap-3"
            >
              <p className="font-medium">
                {e.title} · {e.school}
              </p>
              <p className="shrink-0 text-xs text-muted">{e.year}</p>
            </div>
          ))}
        </div>
      </Section>
    </article>
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
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-accent-strong">
        {title}
      </h3>
      {children}
    </section>
  );
}
