import type { CV } from "@/lib/types";
import { CVDocument } from "./CVDocument";

// CV statique "brut" : aperçu pour le visiteur sans email. Même charte que le CV
// généré, mais non adapté à une offre (cf. étiquette sur la page /cv).
export function CVPreview({
  cv,
  personaId,
}: {
  cv: CV;
  personaId: string;
}) {
  return (
    <CVDocument
      doc={{
        name: cv.name,
        title: cv.title,
        contact: cv.contact,
        summary: cv.summary,
        experiences: cv.experiences,
        education: cv.education,
        skills: cv.skills,
        languages: cv.languages,
      }}
      avatarSrc={`/visuels/avatar-${personaId}.jpg`}
    />
  );
}
