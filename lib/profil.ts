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
