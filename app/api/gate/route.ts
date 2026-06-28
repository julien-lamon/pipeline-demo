import { type NextRequest, NextResponse } from "next/server";
import { GATE_COOKIE, GATE_PURPOSE, isValidEmail } from "@/lib/gate";
import { recordGate } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    email?: unknown;
    consent?: unknown;
  } | null;

  if (!isValidEmail(body?.email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }
  if (body?.consent !== true) {
    return NextResponse.json(
      { error: "Le consentement est requis pour débloquer le coach." },
      { status: 400 },
    );
  }

  const email = body.email.trim().toLowerCase();
  // On ne stocke QUE : email + horodatage + finalité. Rien d'autre.
  await recordGate(email, new Date().toISOString(), GATE_PURPOSE);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(GATE_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 h
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
