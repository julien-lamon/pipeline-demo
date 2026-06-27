// Accès aux données fictives figées. Aucun appel réseau, aucune donnée réelle :
// tout est importé depuis les JSON embarqués dans data/.

import personasJson from "@/data/personas.json";
import rhOffers from "@/data/offers/rh.json";
import marketingOffers from "@/data/offers/marketing.json";
import financeOffers from "@/data/offers/finance.json";
import cvCamille from "@/data/cv/camille.json";
import cvSacha from "@/data/cv/sacha.json";
import cvClaude from "@/data/cv/claude.json";
import type { CV, Offer, Persona, ScoreLevel } from "./types";

/** Seuil de pertinence : en dessous, une offre est marquée "sous le seuil". */
export const SCORE_THRESHOLD = 70;
/** À partir de ce score, une offre est marquée "prioritaire". */
export const PRIORITY_MIN = 85;

const offersByPersona: Record<string, Offer[]> = {
  camille: rhOffers as Offer[],
  sacha: marketingOffers as Offer[],
  claude: financeOffers as Offer[],
};

const cvByPersona: Record<string, CV> = {
  camille: cvCamille as CV,
  sacha: cvSacha as CV,
  claude: cvClaude as CV,
};

export const personas = personasJson as Persona[];

export function getPersona(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}

/** Offres d'un persona, triées par score décroissant. */
export function getOffers(personaId: string): Offer[] {
  return [...(offersByPersona[personaId] ?? [])].sort(
    (a, b) => b.score - a.score,
  );
}

export function getOffer(personaId: string, offerId: string): Offer | undefined {
  return (offersByPersona[personaId] ?? []).find((o) => o.id === offerId);
}

export function getCV(personaId: string): CV | undefined {
  return cvByPersona[personaId];
}

export function isPriority(offer: Offer): boolean {
  return offer.score >= PRIORITY_MIN;
}

export function isBelowThreshold(offer: Offer): boolean {
  return offer.score < SCORE_THRESHOLD;
}

export function scoreLevel(score: number): ScoreLevel {
  if (score >= PRIORITY_MIN) return "high";
  if (score >= SCORE_THRESHOLD) return "mid";
  return "low";
}
