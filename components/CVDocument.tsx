import styles from "./cv.module.css";

// Squelette CV partagé : même charte pour le CV statique (brut) ET le CV
// dynamique (généré par le coach). Purement présentationnel.

type CVDoc = {
  name: string;
  title: string;
  contact?: { email: string; city: string; linkedin: string };
  summary: string;
  experiences: { role: string; company: string; period: string; bullets: string[] }[];
  education: { title: string; school: string; year: string }[];
  skills: string[];
  languages: string[];
  certifications?: string[];
};

export function CVDocument({
  doc,
  avatarSrc,
}: {
  doc: CVDoc;
  avatarSrc: string;
}) {
  return (
    <article className={styles.doc}>
      <header className={styles.header}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarSrc} alt="" className={styles.photo} />
        <div>
          <p className={styles.name}>{doc.name}</p>
          <p className={styles.role}>{doc.title}</p>
          {doc.contact && (
            <p className={styles.contact}>
              {doc.contact.email} · {doc.contact.city} · {doc.contact.linkedin}
            </p>
          )}
        </div>
      </header>

      <Section title="Profil">
        <p className={styles.summary}>{doc.summary}</p>
      </Section>

      <Section title="Expérience">
        {doc.experiences.map((xp, i) => (
          <div key={i} className={styles.xp}>
            <div className={styles.row}>
              <span className={styles.xpRole}>
                {xp.role}, {xp.company}
              </span>
              <span className={styles.period}>{xp.period}</span>
            </div>
            <ul className={styles.bullets}>
              {xp.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section title="Formation">
        {doc.education.map((e, i) => (
          <div key={i} className={`${styles.row} ${styles.eduRow}`}>
            <span>
              {e.title}, {e.school}
            </span>
            <span className={styles.period}>{e.year}</span>
          </div>
        ))}
      </Section>

      <Section title="Compétences">
        <div className={styles.skills}>
          {doc.skills.map((s) => (
            <span key={s} className={styles.skill}>
              {s}
            </span>
          ))}
        </div>
      </Section>

      {doc.certifications && doc.certifications.length > 0 && (
        <Section title="Certifications">
          <ul className={styles.bullets}>
            {doc.certifications.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Langues">
        <p className={styles.langs}>{doc.languages.join(" · ")}</p>
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
    <section className={styles.section}>
      <h2 className={styles.h2}>{title}</h2>
      {children}
    </section>
  );
}
