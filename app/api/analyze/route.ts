import { type NextRequest, NextResponse } from "next/server";
import { streamCoach } from "@/lib/anthropic";
import { costEur, EFFORT, MAX_TOKENS } from "@/lib/config";
import { getOffer, getPersona } from "@/lib/data";
import { checkAccess } from "@/lib/guards";
import { getProfilDoc } from "@/lib/profil";
import { buildAnalyzeNarrativePrompt } from "@/lib/prompts";
import { addSpendEur, incrEmailCount } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Étape 1 du coach : analyse NARRATIVE streamée token par token. Les garde-fous du
// brief B (email gating + plafond global + quota par email) s'appliquent ici comme
// au CV : on vérifie l'accès avant de streamer, on comptabilise après la fin.
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

  const { system, user } = buildAnalyzeNarrativePrompt(
    getProfilDoc(persona.id),
    offer,
  );
  const stream = streamCoach({
    system,
    user,
    maxTokens: MAX_TOKENS.analyze,
    effort: EFFORT.analyze,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason !== "refusal") {
          const cost = costEur(final.usage);
          await addSpendEur(access.date, cost);
          await incrEmailCount(access.date, access.email);
          console.log(
            `[claude] stream in=${final.usage.input_tokens} out=${final.usage.output_tokens} cost=${cost.toFixed(4)}EUR`,
          );
        }
      } catch (err) {
        console.error("analyze stream failed:", err);
        controller.enqueue(
          encoder.encode("\n\n[Analyse interrompue. Réessaie dans un instant.]"),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
