// Garde-fous d'accès appliqués AVANT tout appel Claude : email gating + plafond
// global de dépense + quota par email. Coupures propres (jamais d'erreur brute).

import type { NextRequest } from "next/server";
import { DAILY_BUDGET_EUR, PER_EMAIL_DAILY_QUOTA } from "./config";
import { dayKey, GATE_COOKIE } from "./gate";
import { getEmailCount, getSpendEur } from "./store";

export type AccessResult =
  | { ok: true; email: string; date: string }
  | { ok: false; status: number; code: string; message: string };

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
