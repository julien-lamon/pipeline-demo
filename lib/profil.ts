// Lecture du "document de vérité" d'un persona (server-side, build/runtime).
// Lecture disque locale uniquement — aucun appel réseau.

import { readFileSync } from "node:fs";
import { join } from "node:path";

export function getProfilDoc(personaId: string): string {
  try {
    return readFileSync(
      join(process.cwd(), "content", `profil-${personaId}.md`),
      "utf8",
    );
  } catch {
    return "";
  }
}

// Highlights extraits du document de vérité : le « delta » que le CV ne montre pas
// (objectifs et lignes rouges). Extraction par section ## ... commune aux 3 profils.
export type ProfilObjectif = { term: string; text: string };
export type ProfilHighlights = {
  objectifs: ProfilObjectif[];
  lignesRouges: string[];
};

// Renvoie les lignes d'une section markdown `## <heading>` (jusqu'au ## suivant).
function sectionLines(md: string, heading: string): string[] {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inside = false;
  for (const line of lines) {
    if (line.startsWith("## ")) {
      inside = line.slice(3).trim().toLowerCase() === heading.toLowerCase();
      continue;
    }
    if (inside) out.push(line);
  }
  return out;
}

// Puces `- ...` d'une section, en recollant les lignes de continuation indentées.
function bullets(lines: string[]): string[] {
  const out: string[] = [];
  for (const raw of lines) {
    if (/^\s*-\s+/.test(raw)) {
      out.push(raw.replace(/^\s*-\s+/, "").trim());
    } else if (raw.trim() && out.length && !raw.endsWith(":")) {
      out[out.length - 1] += " " + raw.trim();
    }
  }
  return out;
}

export function getProfilHighlights(personaId: string): ProfilHighlights | null {
  const md = getProfilDoc(personaId);
  if (!md) return null;
  const objectifs = bullets(sectionLines(md, "Cible")).map((b) => {
    const m = b.match(/^Piste\s+[AB]\s*\(([^)]+)\)\s*[:：]\s*(.+)$/);
    return m ? { term: m[1].trim(), text: m[2].trim() } : { term: "", text: b };
  });
  const lignesRouges = bullets(sectionLines(md, "Lignes rouges"));
  return { objectifs, lignesRouges };
}
