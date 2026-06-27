// Types du domaine de la démo. Données 100% fictives et figées (cf. data/).

/** Piste stratégique : A = court terme / cash, B = positionnement long terme. */
export type Piste = "A" | "B";

/** Estimation qualitative des chances d'obtenir un entretien. */
export type Chances = "Faibles" | "Moyennes" | "Élevées";

/** Niveau de score, dérivé du score global (voir lib/data.ts). */
export type ScoreLevel = "high" | "mid" | "low";

/** Une offre d'emploi fictive, déjà scorée par la "veille figée". */
export interface Offer {
  id: string;
  personaId: string;
  title: string;
  company: string;
  location: string;
  /** Type de contrat : CDI, CDD, Freelance, Alternance… */
  contract: string;
  /** Modalité : "Sur site", "Hybride", "Télétravail". */
  remote: string;
  /** Tags décoratifs affichés sur la carte. */
  tags: string[];
  /** Score global 0–100 (tri et badge). */
  score: number;
  /** Sous-score de compatibilité ATS 0–100. */
  scoreAts: number;
  chancesEntretien: Chances;
  piste: Piste;
  /** Justification courte du score (1–2 phrases). */
  notes: string;
}

export interface CVExperience {
  role: string;
  company: string;
  period: string;
  bullets: string[];
}

export interface CVEducation {
  title: string;
  school: string;
  year: string;
}

export interface CV {
  name: string;
  title: string;
  contact: {
    email: string;
    city: string;
    linkedin: string;
  };
  /** Accroche de 3–5 lignes, formulée comme adaptée à l'offre cible. */
  summary: string;
  /** Intitulé de l'offre pour laquelle ce CV est (fictivement) taillé. */
  tailoredFor: string;
  experiences: CVExperience[];
  skills: string[];
  education: CVEducation[];
  languages: string[];
  /** Nombre de pages cible (1 pour junior/middle, 2 pour senior). */
  pages: 1 | 2;
}

export interface Persona {
  /** Identifiant et slug d'URL (ex. "camille"). */
  id: string;
  /** Affiché : prénom + initiale seule (ex. "Camille D."). */
  name: string;
  initials: string;
  sector: string;
  seniority: "junior" | "middle" | "senior";
  seniorityLabel: string;
  title: string;
  /** Pitch court affiché sur la carte de sélection. */
  pitch: string;
}
