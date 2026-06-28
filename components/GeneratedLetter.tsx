"use client";

import { useEffect, useState } from "react";

// Lettre de motivation générée : textarea ÉDITABLE (le visiteur retouche) +
// bouton Copier. Pas de téléchargement, pas de correcteur intégré (la LM part
// dans un email, le copier-coller est le bon geste).
export function GeneratedLetter({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);
  const [copied, setCopied] = useState(false);

  // Met à jour si une nouvelle lettre est générée.
  useEffect(() => {
    setText(initial);
  }, [initial]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span
          className={`text-xs ${
            text.length > 1800 ? "font-semibold text-accent-strong" : "text-muted"
          }`}
        >
          {text.length} signes
        </span>
        <button
          type="button"
          onClick={copy}
          className="rounded-xl border border-accent px-3 py-1.5 text-xs font-semibold text-accent-strong transition hover:bg-accent-soft"
        >
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={18}
        spellCheck={false}
        className="w-full resize-y rounded-xl border border-border bg-surface p-3 text-sm leading-relaxed text-foreground outline-none focus:border-accent"
      />
    </div>
  );
}
