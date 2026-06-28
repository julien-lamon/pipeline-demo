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

export interface TailoredCV {
  title: string;
  summary: string;
  tailoredFor: string;
  /** Compétences réordonnées/priorisées pour l'offre (issues du profil). */
  highlightedSkills: string[];
  /** Expériences pertinentes remontées et reformulées (sans rien inventer). */
  experiences: TailoredExperience[];
  /** Ce que l'offre demande et que le profil n'a pas — signalé, pas fabriqué. */
  missingForOffer: string[];
}

export const CV_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
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
    missingForOffer: { type: "array", items: { type: "string" } },
  },
  required: [
    "title",
    "summary",
    "tailoredFor",
    "highlightedSkills",
    "experiences",
    "missingForOffer",
  ],
} as const;
