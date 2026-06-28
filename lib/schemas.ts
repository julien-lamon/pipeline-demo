// Schémas de sortie structurée (JSON Schema) + types TS associés.
// Contraintes Structured Outputs : additionalProperties:false partout, tous les
// champs en `required`, pas de min/max length. Cela garantit un JSON valide et
// parsable — pas de parsing fragile de texte libre.

// --- Analyse offre/profil ---------------------------------------------------

export interface RedLineHit {
  /** La ligne rouge du profil qui est heurtée. */
  line: string;
  /** Ce que l'offre contient qui la déclenche. */
  offending: string;
  severity: "bloquante" | "à surveiller";
}

export interface AnalysisResult {
  verdict: "Foncer" | "À tenter" | "Prudence" | "À éviter";
  summary: string;
  /** Points d'adéquation forts (tirés du profil). */
  fitStrengths: string[];
  /** Ce que l'offre exige et que le profil n'a pas (dit, jamais inventé). */
  gaps: string[];
  /** Lignes rouges heurtées (vide si aucune). */
  redLines: RedLineHit[];
  recommendation: string;
}

export const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: {
      type: "string",
      enum: ["Foncer", "À tenter", "Prudence", "À éviter"],
    },
    summary: { type: "string" },
    fitStrengths: { type: "array", items: { type: "string" } },
    gaps: { type: "array", items: { type: "string" } },
    redLines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          line: { type: "string" },
          offending: { type: "string" },
          severity: { type: "string", enum: ["bloquante", "à surveiller"] },
        },
        required: ["line", "offending", "severity"],
      },
    },
    recommendation: { type: "string" },
  },
  required: [
    "verdict",
    "summary",
    "fitStrengths",
    "gaps",
    "redLines",
    "recommendation",
  ],
} as const;

// --- CV ciblé ---------------------------------------------------------------

export interface TailoredExperience {
  role: string;
  company: string;
  period: string;
  bullets: string[];
}

export interface TailoredEducation {
  title: string;
  school: string;
  year: string;
}

export interface TailoredContact {
  email: string;
  city: string;
  linkedin: string;
}

export interface TailoredCV {
  name: string;
  title: string;
  contact: TailoredContact;
  summary: string;
  tailoredFor: string;
  /** Compétences réordonnées/priorisées pour l'offre (issues du profil). */
  highlightedSkills: string[];
  /** Expériences pertinentes remontées et reformulées (sans rien inventer). */
  experiences: TailoredExperience[];
  education: TailoredEducation[];
  languages: string[];
  certifications: string[];
  /** Ce que l'offre demande et que le profil n'a pas : signalé, pas fabriqué. */
  missingForOffer: string[];
}

export const CV_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" },
    title: { type: "string" },
    contact: {
      type: "object",
      additionalProperties: false,
      properties: {
        email: { type: "string" },
        city: { type: "string" },
        linkedin: { type: "string" },
      },
      required: ["email", "city", "linkedin"],
    },
    summary: { type: "string" },
    tailoredFor: { type: "string" },
    highlightedSkills: { type: "array", items: { type: "string" } },
    experiences: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          role: { type: "string" },
          company: { type: "string" },
          period: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
        },
        required: ["role", "company", "period", "bullets"],
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          school: { type: "string" },
          year: { type: "string" },
        },
        required: ["title", "school", "year"],
      },
    },
    languages: { type: "array", items: { type: "string" } },
    certifications: { type: "array", items: { type: "string" } },
    missingForOffer: { type: "array", items: { type: "string" } },
  },
  required: [
    "name",
    "title",
    "contact",
    "summary",
    "tailoredFor",
    "highlightedSkills",
    "experiences",
    "education",
    "languages",
    "certifications",
    "missingForOffer",
  ],
} as const;
