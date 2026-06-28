"use client";

import { useEffect, useState } from "react";
import type { AnalysisResult as Analysis, TailoredCV } from "@/lib/schemas";
import { AnalysisResult } from "./AnalysisResult";
import { EmailGate } from "./EmailGate";
import { GeneratedCV } from "./GeneratedCV";

type OfferRef = { id: string; title: string; company: string };

export function CoachLive({
  personaId,
  offers,
  initialOfferId,
}: {
  personaId: string;
  offers: OfferRef[];
  initialOfferId?: string;
}) {
  const [offerId, setOfferId] = useState(initialOfferId ?? offers[0]?.id ?? "");
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

  const offer = offers.find((o) => o.id === offerId);

  function changeOffer(id: string) {
    setOfferId(id);
    // Les résultats portaient sur l'offre précédente : on repart propre.
    setAnalysis(null);
    setCv(null);
    setError(null);
  }

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

  if (offers.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-surface p-5 text-sm text-muted">
        Aucune offre disponible pour ce profil.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sélecteur d'offre : l'écran est autonome, quel que soit le chemin d'arrivée */}
      <label className="block rounded-2xl border border-border bg-card p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Offre ciblée
        </span>
        <select
          value={offerId}
          onChange={(e) => changeOffer(e.target.value)}
          className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        >
          {offers.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title} · {o.company}
            </option>
          ))}
        </select>
      </label>

      {/* Captation d'email : déverrouille les deux actions live */}
      {!gated ? (
        <EmailGate onUnlock={() => setGated(true)} />
      ) : (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => run("analyze")}
            disabled={loading !== null}
            className="rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "analyze"
              ? "Analyse en cours…"
              : "Analyser cette offre"}
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
      )}

      {error && (
        <div className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-accent-strong">
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
