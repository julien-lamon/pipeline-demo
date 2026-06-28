// Relais serveur vers Claude. Le navigateur n'appelle JAMAIS l'API Anthropic en
// direct : il passe par nos routes (app/api/*), qui seules détiennent la clé.
// La clé est lue depuis process.env.ANTHROPIC_API_KEY par le SDK.

import Anthropic from "@anthropic-ai/sdk";
import { costEur, MODEL } from "./config";

const client = new Anthropic();

/** Levée quand le modèle refuse (safety) — mappée en message propre côté route. */
export class ClaudeRefusalError extends Error {
  constructor() {
    super("Le modèle a refusé de répondre à cette demande.");
    this.name = "ClaudeRefusalError";
  }
}

/**
 * Appel Claude en sortie structurée. Renvoie l'objet validé contre `schema`
 * (pas de parsing fragile) et le coût réel de l'appel en euros.
 *
 * - thinking désactivé + effort bas/medium : pas de réflexion coûteuse inutile.
 * - max_tokens borné : pas de sortie géante.
 */
export async function callStructured<T>(opts: {
  system: string;
  user: string;
  schema: object;
  maxTokens: number;
  effort: "low" | "medium" | "high" | "max";
}): Promise<{ data: T; cost: number }> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens,
    thinking: { type: "disabled" },
    output_config: {
      effort: opts.effort,
      format: {
        type: "json_schema",
        schema: opts.schema as Record<string, unknown>,
      },
    },
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });

  if (res.stop_reason === "refusal") throw new ClaudeRefusalError();

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const data = JSON.parse(text) as T;
  const cost = costEur(res.usage);
  // Télémétrie serveur (pas de secret) : tokens réels + coût de l'appel.
  console.log(
    `[claude] ${MODEL} in=${res.usage.input_tokens} out=${res.usage.output_tokens} cost=${cost.toFixed(4)}EUR`,
  );
  return { data, cost };
}

/**
 * Appel narratif en STREAMING (étape 1 du coach). Renvoie le flux SDK : l'appelant
 * pipe les deltas de texte vers le client et lit l'usage via `finalMessage()` à la
 * fin pour comptabiliser le coût. thinking désactivé (on ne streame que la sortie
 * narrative, jamais le raisonnement interne) ; max_tokens borné.
 */
export function streamCoach(opts: {
  system: string;
  user: string;
  maxTokens: number;
  effort: "low" | "medium" | "high" | "max";
}) {
  return client.messages.stream({
    model: MODEL,
    max_tokens: opts.maxTokens,
    thinking: { type: "disabled" },
    output_config: { effort: opts.effort },
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });
}
