// Email gating minimal (RGPD allégé). On ne stocke QUE : email + horodatage +
// finalité (accès démo). Aucun contenu personnel du visiteur, aucun CV visiteur.

/** Nom du cookie httpOnly qui identifie un visiteur ayant consenti. */
export const GATE_COOKIE = "coach_email";

/** Finalité unique du traitement (consignée avec l'email). */
export const GATE_PURPOSE = "Accès à la démonstration du coach (test produit)";

/** Mention affichée au point de saisie, avant consentement. */
export const RGPD_NOTICE =
  "En débloquant le coach, vous acceptez que votre email soit conservé dans " +
  "l'unique but de gérer l'accès à cette démonstration et de vous recontacter " +
  "à propos du test. Aucune revente, aucun autre usage. Vous pouvez demander " +
  "l'effacement à tout moment en écrivant à contact@exemple.fr.";

/** Validation d'email volontairement simple (le gating n'est pas un mur de sécurité). */
export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Clé de jour (UTC) pour les compteurs : "AAAA-MM-JJ". */
export function dayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
