// Configuration serveur du coach live. Aucune valeur secrète ici : la clé API
// vit uniquement dans process.env.ANTHROPIC_API_KEY (jamais committée).

/** Modèle utilisé pour les deux actions live (tranché par l'AMO). */
export const MODEL = "claude-sonnet-4-6";

/** Plafond GLOBAL de dépense par jour, en euros. Au-delà : coupure propre. */
export const DAILY_BUDGET_EUR = Number(process.env.DAILY_BUDGET_EUR ?? 10);

/** Quota d'actions live par email et par jour. */
export const PER_EMAIL_DAILY_QUOTA = Number(
  process.env.PER_EMAIL_DAILY_QUOTA ?? 10,
);

/** Bornes de génération par appel (évite les sorties géantes coûteuses). */
export const MAX_TOKENS = {
  analyze: 1536,
  cv: 3072,
} as const;

/** Effort de réflexion réglé bas/medium (pas de thinking coûteux inutile). */
export const EFFORT = {
  analyze: "low",
  cv: "medium",
} as const;

// Tarifs claude-sonnet-4-6 en USD / million de tokens (cf. claude-api).
const USD_PER_MTOK = {
  input: 3,
  output: 15,
  cacheRead: 0.3, // ~0,1x input
  cacheWrite: 3.75, // ~1,25x input
} as const;

/** Conversion USD → EUR (figée ; ajuster si le taux dérive significativement). */
export const EUR_PER_USD = 0.92;

/** Coût en euros d'un appel à partir de l'objet `usage` renvoyé par l'API. */
export function costEur(usage: {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}): number {
  const usd =
    ((usage.input_tokens ?? 0) * USD_PER_MTOK.input +
      (usage.output_tokens ?? 0) * USD_PER_MTOK.output +
      (usage.cache_read_input_tokens ?? 0) * USD_PER_MTOK.cacheRead +
      (usage.cache_creation_input_tokens ?? 0) * USD_PER_MTOK.cacheWrite) /
    1_000_000;
  return usd * EUR_PER_USD;
}
