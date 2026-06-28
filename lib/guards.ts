// Garde-fous d'accès appliqués AVANT tout appel Claude : email gating + plafond
// global de dépense + quota par email. Coupures propres (jamais d'erreur brute).

import type { NextRequest } from "next/server";
import { DAILY_BUDGET_EUR, PER_EMAIL_DAILY_QUOTA } from "./config";
import { dayKey, GATE_COOKIE } from "./gate";
import {
  getEmailCount,
  getLastGenMs,
  getSpendEur,
  hasGenerated,
  markGenerated,
  setLastGenMs,
} from "./store";

export type AccessResult =
  | { ok: true; email: string; date: string }
  | { ok: false; status: number; code: string; message: string };

/** Type de génération soumise aux garde-fous budget (1-gen + throttle). */
export type GenKind = "cv" | "letter";

/** Délai minimum entre deux générations du MEME type, par email (anti-script). */
export const THROTTLE_MS = 120_000;

// Point d'extension anti-bot : si l'AMO active Cloudflare Turnstile plus tard,
// la vérification du token humain se branchera ICI (avant les garde-fous budget),
// sans toucher au reste. Volontairement non implémenté pour l'instant (décision AMO).

export async function checkAccess(req: NextRequest): Promise<AccessResult> {
  const email = req.cookies.get(GATE_COOKIE)?.value;
  if (!email) {
    return {
      ok: false,
      status: 401,
      code: "gating_required",
      message: "Indiquez votre email pour débloquer le coach.",
    };
  }

  const date = dayKey();

  if ((await getSpendEur(date)) >= DAILY_BUDGET_EUR) {
    return {
      ok: false,
      status: 503,
      code: "capacity",
      message: "Démo à pleine capacité, réessayez demain.",
    };
  }

  if ((await getEmailCount(date, email)) >= PER_EMAIL_DAILY_QUOTA) {
    return {
      ok: false,
      status: 429,
      code: "email_quota",
      message: "Quota quotidien atteint pour cet email. Réessayez demain.",
    };
  }

  return { ok: true, email, date };
}

export type GenGuardResult =
  | { ok: true }
  | { ok: false; status: number; code: string; message: string };

// Garde-fous budget appliqués au CV et a la LM, CÔTÉ SERVEUR (un blocage client
// seul est contournable). Deux verrous :
//  1. throttle : un délai minimum entre deux générations du même type ;
//  2. 1-génération par couple (email, type, persona, offre), sauf régénération
//     volontaire explicite (regenerate=true).
export async function checkGenGuards(opts: {
  email: string;
  date: string;
  kind: GenKind;
  personaId: string;
  offerId: string;
  regenerate: boolean;
}): Promise<GenGuardResult> {
  // 1-génération d'abord : un re-clic sans régénération explicite renvoie le message
  // le plus clair ("déjà généré"), avant de considérer le throttle.
  if (
    !opts.regenerate &&
    (await hasGenerated(
      opts.date,
      opts.email,
      opts.kind,
      opts.personaId,
      opts.offerId,
    ))
  ) {
    return {
      ok: false,
      status: 409,
      code: "already_generated",
      message: "Deja genere pour cette offre. Utilisez Regenerer pour relancer.",
    };
  }

  // Throttle : s'applique aux régénérations (et a toute nouvelle génération du type).
  const last = await getLastGenMs(opts.email, opts.kind);
  const elapsed = Date.now() - last;
  if (last && elapsed < THROTTLE_MS) {
    const wait = Math.ceil((THROTTLE_MS - elapsed) / 1000);
    return {
      ok: false,
      status: 429,
      code: "throttled",
      message: `Patientez quelques instants avant une nouvelle generation (environ ${wait} s).`,
    };
  }

  return { ok: true };
}

/** À appeler APRÈS une génération réussie : pose le marqueur 1-gen + l'horodatage throttle. */
export async function recordGen(opts: {
  email: string;
  date: string;
  kind: GenKind;
  personaId: string;
  offerId: string;
}): Promise<void> {
  await markGenerated(
    opts.date,
    opts.email,
    opts.kind,
    opts.personaId,
    opts.offerId,
  );
  await setLastGenMs(opts.email, opts.kind, Date.now());
}
