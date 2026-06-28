"use client";

import { useEffect, useRef, useState } from "react";
import type { TailoredCV } from "@/lib/schemas";
import { AnalysisModal } from "./AnalysisModal";
import { EmailGate } from "./EmailGate";
import { GeneratedCV } from "./GeneratedCV";
import { GeneratedLetter } from "./GeneratedLetter";

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

  // Étape 1 (analyse streamée)
  const [analysisText, setAnalysisText] = useState("");
  const [analysisStreaming, setAnalysisStreaming] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Étape 2 (CV structuré)
  const [cv, setCv] = useState<TailoredCV | null>(null);
  const [generating, setGenerating] = useState(false);

  // Étape 4 (lettre de motivation)
  const [letter, setLetter] = useState<string | null>(null);
  const [lettering, setLettering] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Persistance par persona : l'analyse + le CV survivent à la navigation dans le
  // fil d'Ariane, et sont purgés au changement de persona. sessionStorage = visite.
  const storageKey = `coach-state:${personaId}`;
  const [hydrated, setHydrated] = useState(false);

  // A5 : ancre + drapeau pour défiler vers la lettre à sa première génération.
  const letterRef = useRef<HTMLElement | null>(null);
  const scrollLetterOnRender = useRef(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("coach_gated") === "1") setGated(true);
    } catch {}
  }, []);

  // Restaure l'état du coach pour CE persona ; purge celui des AUTRES personas.
  useEffect(() => {
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith("coach-state:") && k !== storageKey) {
          sessionStorage.removeItem(k);
        }
      }
      const raw = sessionStorage.getItem(storageKey);
      const saved = raw
        ? (JSON.parse(raw) as {
            offerId?: string;
            analysisText?: string;
            analysisDone?: boolean;
            cv?: TailoredCV | null;
            letter?: string | null;
          })
        : null;
      // Une URL ?offer force une cible précise ; sinon on restaure la dernière.
      const forced = Boolean(initialOfferId && initialOfferId !== saved?.offerId);
      if (saved && !forced) {
        if (saved.offerId && offers.some((o) => o.id === saved.offerId)) {
          setOfferId(saved.offerId);
        }
        setAnalysisText(saved.analysisText ?? "");
        setAnalysisDone(Boolean(saved.analysisDone));
        setCv(saved.cv ?? null);
        setLetter(saved.letter ?? null);
      }
    } catch {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persiste l'analyse + le CV + l'offre ciblée (après hydratation).
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ offerId, analysisText, analysisDone, cv, letter }),
      );
    } catch {}
  }, [hydrated, storageKey, offerId, analysisText, analysisDone, cv, letter]);

  // A5 : défile vers la lettre quand elle vient d'être générée pour la 1re fois.
  useEffect(() => {
    if (letter && scrollLetterOnRender.current) {
      scrollLetterOnRender.current = false;
      letterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [letter]);

  const offer = offers.find((o) => o.id === offerId);

  function relock() {
    setGated(false);
    try {
      localStorage.removeItem("coach_gated");
    } catch {}
  }

  function resetForOffer() {
    setAnalysisText("");
    setAnalysisDone(false);
    setModalOpen(false);
    setCv(null);
    setLetter(null);
    setError(null);
  }

  function changeOffer(id: string) {
    setOfferId(id);
    resetForOffer();
  }

  // Re-verrouille côté client pour revoir l'étape de captation (utile en démo).
  function resetAccess() {
    relock();
    resetForOffer();
  }

  // Étape 1 : analyse narrative streamée dans le modal.
  async function runAnalyze() {
    if (!offer) return;
    setError(null);
    setAnalysisStreaming(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId, offerId: offer.id }),
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (res.status === 401) relock();
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      setAnalysisText("");
      setAnalysisDone(false);
      setModalOpen(true);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setAnalysisText(acc);
      }
      setAnalysisDone(true);
    } catch {
      setError("Réseau indisponible.");
    } finally {
      setAnalysisStreaming(false);
    }
  }

  // Étape 2 : génération du CV (sortie structurée). Réservée à l'après-analyse.
  // regenerate=true : régénération volontaire (re-déclenche un appel côté serveur).
  async function runCv(regenerate = false) {
    if (!offer || !analysisDone) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId, offerId: offer.id, regenerate }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        cv?: TailoredCV;
      };
      if (!res.ok) {
        if (res.status === 401) relock();
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      setCv(data.cv ?? null);
    } catch {
      setError("Réseau indisponible.");
    } finally {
      setGenerating(false);
    }
  }

  // Étape 4 : lettre de motivation (sortie structurée, texte simple).
  // Gating après l'analyse (pas après le CV) : la LM se génère depuis le document
  // de vérité + l'offre, indépendamment du CV ; on évite de forcer un appel CV.
  async function runLetter(regenerate = false) {
    if (!offer || !analysisDone) return;
    setLettering(true);
    setError(null);
    try {
      const res = await fetch("/api/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId, offerId: offer.id, regenerate }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        letter?: string;
      };
      if (!res.ok) {
        if (res.status === 401) relock();
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      // A5 : défilement auto seulement à la PREMIÈRE génération (pas en régénération).
      scrollLetterOnRender.current = letter === null;
      setLetter(data.letter ?? null);
    } catch {
      setError("Réseau indisponible.");
    } finally {
      setLettering(false);
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

      {!gated ? (
        <EmailGate onUnlock={() => setGated(true)} />
      ) : (
        <div className="space-y-2">
          <ol className="flex flex-col gap-3 sm:flex-row">
            <li className="flex-1">
              <button
                type="button"
                onClick={() =>
                  analysisDone ? setModalOpen(true) : runAnalyze()
                }
                disabled={analysisStreaming}
                className="w-full rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {analysisStreaming
                  ? "Analyse en cours…"
                  : analysisDone
                    ? "Revoir l’analyse"
                    : "1. Analyser cette offre"}
              </button>
            </li>
            <li className="flex-1">
              <button
                type="button"
                onClick={() => runCv()}
                disabled={!analysisDone || generating || cv !== null}
                title={
                  analysisDone ? undefined : "Lance d’abord l’analyse de l’offre"
                }
                className="w-full rounded-xl border border-accent px-5 py-3 font-semibold text-accent-strong transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generating
                  ? "Génération en cours…"
                  : cv
                    ? "2. CV généré ✓"
                    : "2. Générer le CV ciblé"}
              </button>
            </li>
            <li className="flex-1">
              <button
                type="button"
                onClick={() => runLetter()}
                disabled={!analysisDone || lettering || letter !== null}
                title={
                  analysisDone ? undefined : "Lance d’abord l’analyse de l’offre"
                }
                className="w-full rounded-xl border border-accent px-5 py-3 font-semibold text-accent-strong transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                {lettering
                  ? "Rédaction en cours…"
                  : letter
                    ? "3. Lettre générée ✓"
                    : "3. Générer la lettre"}
              </button>
            </li>
          </ol>
          {!analysisDone && (
            <p className="text-xs text-muted">
              Le CV et la lettre se débloquent à la fin de l’analyse.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-accent-strong">
          {error}
        </div>
      )}

      {cv && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight">CV ciblé</h2>
            <button
              type="button"
              onClick={() => runCv(true)}
              disabled={generating}
              className="text-xs font-semibold text-accent-strong underline underline-offset-2 transition hover:text-accent disabled:opacity-50"
            >
              {generating ? "Régénération…" : "Régénérer"}
            </button>
          </div>
          <GeneratedCV cv={cv} personaId={personaId} />
        </section>
      )}

      {letter && (
        <section ref={letterRef} className="scroll-mt-20">
          <div className="mb-1 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight">
              Lettre de motivation
            </h2>
            <button
              type="button"
              onClick={() => runLetter(true)}
              disabled={lettering}
              className="text-xs font-semibold text-accent-strong underline underline-offset-2 transition hover:text-accent disabled:opacity-50"
            >
              {lettering ? "Régénération…" : "Régénérer"}
            </button>
          </div>
          <p className="mb-3 text-sm text-muted">
            Vous pouvez modifier la lettre comme vous le souhaitez directement
            avant de la copier.
          </p>
          <GeneratedLetter initial={letter} />
        </section>
      )}

      {gated && (
        <button
          type="button"
          onClick={resetAccess}
          className="text-xs text-ink-faint underline underline-offset-2 hover:text-muted"
        >
          Accès débloqué. Réinitialiser pour revoir la captation d’email.
        </button>
      )}

      <AnalysisModal
        open={modalOpen}
        offerTitle={offer ? `${offer.title} · ${offer.company}` : ""}
        text={analysisText}
        streaming={analysisStreaming}
        done={analysisDone}
        generating={generating}
        onClose={() => setModalOpen(false)}
        onGenerate={() => {
          setModalOpen(false);
          if (!cv) runCv();
        }}
      />
    </div>
  );
}
