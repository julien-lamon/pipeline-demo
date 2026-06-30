"use client";

import { useState } from "react";

// Carte repliable « jumelle » : un en-tête (titre + bouton Voir en entier) puis le
// contenu. Deux modes :
//  - clamp : le contenu (children) est tronqué avec un fondu quand replié.
//  - preview : `preview` est montré quand replié ; déplié = preview + children.
export function ExpandableCard({
  title,
  subtitle,
  badge,
  clamp = false,
  preview,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  clamp?: boolean;
  preview?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-2 text-base font-bold tracking-tight">
            {title}
            {badge && (
              <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-strong">
                {badge}
              </span>
            )}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs font-medium text-ink-faint">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-accent-strong transition hover:border-accent/50"
        >
          {open ? "Réduire" : "Voir en entier"}
          <span aria-hidden>{open ? "▴" : "▾"}</span>
        </button>
      </div>

      <div className="pt-4">
        {clamp ? (
          open ? (
            children
          ) : (
            <div className="relative max-h-80 overflow-hidden">
              {children}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
            </div>
          )
        ) : (
          <>
            {preview}
            {open && (
              <div className="mt-5 border-t border-border pt-5">{children}</div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
