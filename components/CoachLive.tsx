"use client";

import { useEffect, useState } from "react";
import type { AnalysisResult as Analysis, TailoredCV } from "@/lib/schemas";
import { AnalysisResult } from "./AnalysisResult";
import { EmailGate } from "./EmailGate";
import { GeneratedCV } from "./GeneratedCV";

type OfferRef = { id: string; title: string; company: string };

export function CoachLive({
  personaId,
  offer,
}: {
  personaId: string;
  offer: OfferRef | null;
}) {
  const [gated, setGated] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [cv, setCv] = useState<TailoredCV | null>(null);
  const [loading, setLoading] = useState<null | "analyze" | "cv">(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem("coach_gated") === "1") setGated(true);
    } catch {}
  }, []);

  async function run(kind: "analyze" | "cv") {
    if (!offer) return;
    setLoading(kind);
    setError(null);
    try {
      const res = await fetch(`/api/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId, offerId: offer.id }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        analysis?: Analysis;
        cv?: TailoredCV;
      };
      if (!res.ok) {
        if (res.status === 401) {
          setGated(false);
          try {
            localStorage.removeItem("coach_gated");
          } catch {}
        }
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      if (kind === "analyze") setAnalysis(data.analysis ?? null);
      else setCv(data.cv ?? null);
    } catch {
      setError("Réseau indisponible.");
    } finally {
      setLoading(null);
    }
  }

  if (!offer) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-5 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/visuels/spot-etat-vide.svg"
          alt=""
          className="mx-auto w-full max-w-xs"
        />
        <p className="mt-2 text-sm text-muted">
          Choisissez d’abord une offre dans la liste pour cibler le coaching.
        </p>
      </div>
    );
  }

  if (!gated) {
    return <EmailGate onUnlock={() => setGated(true)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => run("analyze")}
          disabled={loading !== null}
          className="rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === "analyze" ? "Analyse en cours…" : "Analyser cette offre"}
        </button>
        <button
          type="button"
          onClick={() => run("cv")}
          disabled={loading !== null}
          className="rounded-xl border border-accent px-5 py-3 font-semibold text-accent-strong transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === "cv" ? "Génération en cours…" : "Générer le CV ciblé"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {analysis && (
        <section>
          <h2 className="mb-3 text-lg font-bold tracking-tight">Analyse</h2>
          <AnalysisResult analysis={analysis} />
        </section>
      )}

      {cv && (
        <section>
          <h2 className="mb-3 text-lg font-bold tracking-tight">CV ciblé</h2>
          <GeneratedCV cv={cv} />
        </section>
      )}
    </div>
  );
}
