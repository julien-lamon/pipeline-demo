// Types du domaine de la démo. Données 100% fictives et figées (cf. data/).

/** Piste stratégique : A = court terme / cash, B = positionnement long terme. */
export type Piste = "A" | "B";

/** Estimation qualitative des chances d'obtenir un entretien. */
export type Chances = "Faibles" | "Moyennes" | "Élevées";

/** Niveau de score, dérivé du score global (voir lib/data.ts). */
export type ScoreLevel = "high" | "mid" | "low";

/** Corps d'annonce complet d'une offre. C'est ce que lit le coach (offerBlock). */
export interface OfferDescription {
  context: string;
  /** Missions du poste. */
  missions: string[];
  /** Profil recherché (attendus côté candidat). */
  profile: string[];
  /** Compétences et outils exigés (la matière du score ATS). */
  skills: string[];
  /** Diplôme requis (ou "Non précisé"). */
  diploma: string;
  /** Rémunération : fixe, et part variable explicite sur 1 à 2 offres. */
  salary: string;
  /** Conditions récapitulées : contrat, lieu, télétravail. */
  conditions: string;
}

/** Justification factuelle du score ATS (mots-clés). Affichée dans l'UI, jamais transmise au coach. */
export interface OfferAtsMatch {
  covered: string[];
  missing: string[];
}

/** Une offre d'emploi fictive et figée (corps d'annonce complet + score ATS figé). */
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
  /** Score ATS = proximité sémantique offre/profil (cf. docs/scoring-ats.md). Figé, 0-100. */
  score: number;
  chancesEntretien: Chances;
  piste: Piste;
  atsMatch: OfferAtsMatch;
  description: OfferDescription;
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
