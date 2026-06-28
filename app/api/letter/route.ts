import { type NextRequest, NextResponse } from "next/server";
import { callStructured, ClaudeRefusalError } from "@/lib/anthropic";
import { EFFORT, MAX_TOKENS } from "@/lib/config";
import { getOffer, getPersona } from "@/lib/data";
import { checkAccess, checkGenGuards, recordGen } from "@/lib/guards";
import { getProfilDoc } from "@/lib/profil";
import { buildLetterPrompt } from "@/lib/prompts";
import { COVER_LETTER_SCHEMA, type CoverLetter } from "@/lib/schemas";
import { addSpendEur, incrEmailCount } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Étape 4 du coach : lettre de motivation, générée à la volée en sortie structurée
// (texte simple). Mêmes garde-fous que le CV (gating + plafond + quota).
export async function POST(req: NextRequest) {
  const access = await checkAccess(req);
  if (!access.ok) {
    return NextResponse.json(
      { error: access.message, code: access.code },
      { status: access.status },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    personaId?: unknown;
    offerId?: unknown;
    regenerate?: unknown;
  } | null;
  const persona = getPersona(String(body?.personaId));
  const offer = persona ? getOffer(persona.id, String(body?.offerId)) : undefined;
  if (!persona || !offer) {
    return NextResponse.json(
      { error: "Profil ou offre inconnu." },
      { status: 400 },
    );
  }

  // Garde-fous budget (serveur) : throttle + 1 génération/offre (sauf régénération).
  const guard = await checkGenGuards({
    email: access.email,
    date: access.date,
    kind: "letter",
    personaId: persona.id,
    offerId: offer.id,
    regenerate: body?.regenerate === true,
  });
  if (!guard.ok) {
    return NextResponse.json(
      { error: guard.message, code: guard.code },
      { status: guard.status },
    );
  }

  // Source : document de vérité + corps de l'offre (jamais le CV statique).
  const { system, user } = buildLetterPrompt(getProfilDoc(persona.id), offer);

  try {
    const { data, cost } = await callStructured<CoverLetter>({
      system,
      user,
      schema: COVER_LETTER_SCHEMA,
      maxTokens: MAX_TOKENS.letter,
      effort: EFFORT.letter,
    });
    await addSpendEur(access.date, cost);
    await incrEmailCount(access.date, access.email);
    await recordGen({
      email: access.email,
      date: access.date,
      kind: "letter",
      personaId: persona.id,
      offerId: offer.id,
    });
    return NextResponse.json({ letter: data.letter });
  } catch (err) {
    if (err instanceof ClaudeRefusalError) {
      return NextResponse.json(
        { error: "Le coach n'a pas pu rédiger la lettre." },
        { status: 422 },
      );
    }
    console.error("letter failed:", err);
    return NextResponse.json(
      { error: "Erreur lors de la génération. Réessayez." },
      { status: 500 },
    );
  }
}
