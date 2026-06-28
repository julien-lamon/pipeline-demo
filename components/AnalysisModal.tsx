"use client";

import { useEffect, useRef } from "react";

// Pop-in affichant l'analyse du coach streamée token par token (étape 1).
// Le bouton "Générer le CV" n'est actif qu'une fois l'analyse terminée.
export function AnalysisModal({
  open,
  offerTitle,
  text,
  streaming,
  done,
  generating,
  onClose,
  onGenerate,
}: {
  open: boolean;
  offerTitle: string;
  text: string;
  streaming: boolean;
  done: boolean;
  generating: boolean;
  onClose: () => void;
  onGenerate: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  // Auto-défilement vers le bas au fil des tokens.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [text]);

  // Échap pour fermer.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Analyse de l’offre"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">
              Analyse de l’offre
            </p>
            <p className="mt-0.5 text-sm font-semibold">{offerTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg px-2 py-1 text-muted transition hover:bg-surface"
          >
            ✕
          </button>
        </div>

        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto whitespace-pre-wrap p-4 text-sm leading-relaxed text-foreground/90"
        >
          {text || (streaming ? "" : null)}
          {streaming && !text && (
            <span className="text-muted">Le coach lit l’offre…</span>
          )}
          {streaming && (
            <span
              className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-accent align-text-bottom"
              aria-hidden
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border p-4">
          <span className="text-xs text-muted">
            {streaming ? "Analyse en cours…" : "Analyse terminée."}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted transition hover:bg-surface"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={onGenerate}
              disabled={!done || generating}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? "Génération…" : "Générer le CV ciblé →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
