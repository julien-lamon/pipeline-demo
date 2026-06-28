import { type NextRequest, NextResponse } from "next/server";
import { callStructured, ClaudeRefusalError } from "@/lib/anthropic";
import { EFFORT, MAX_TOKENS } from "@/lib/config";
import { getOffer, getPersona } from "@/lib/data";
import { checkAccess } from "@/lib/guards";
import { getProfilDoc } from "@/lib/profil";
import { buildAnalyzePrompt } from "@/lib/prompts";
import { type AnalysisResult, ANALYSIS_SCHEMA } from "@/lib/schemas";
import { addSpendEur, incrEmailCount } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  } | null;
  const persona = getPersona(String(body?.personaId));
  const offer = persona ? getOffer(persona.id, String(body?.offerId)) : undefined;
  if (!persona || !offer) {
    return NextResponse.json(
      { error: "Profil ou offre inconnu." },
      { status: 400 },
    );
  }

  const { system, user } = buildAnalyzePrompt(getProfilDoc(persona.id), offer);

  try {
    const { data, cost } = await callStructured<AnalysisResult>({
      system,
      user,
      schema: ANALYSIS_SCHEMA,
      maxTokens: MAX_TOKENS.analyze,
      effort: EFFORT.analyze,
    });
    // Comptabilisation après succès : dépense globale + quota de l'email.
    await addSpendEur(access.date, cost);
    await incrEmailCount(access.date, access.email);
    return NextResponse.json({ analysis: data });
  } catch (err) {
    if (err instanceof ClaudeRefusalError) {
      return NextResponse.json(
        { error: "Le coach n'a pas pu traiter cette offre." },
        { status: 422 },
      );
    }
    console.error("analyze failed:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse. Réessayez." },
      { status: 500 },
    );
  }
}
