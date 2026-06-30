import Image from "next/image";

// Recadrage par persona : les avatars sources ont des cercles dessinés différents
// (Camille : fin outline ; Claude : disque plein → double cercle ; Sacha : aucun).
// On zoome/repositionne chacun pour pousser le cercle dessiné hors cadre, puis le
// CSS fournit l'UNIQUE cercle + ring, identique pour tous.
const CROP: Record<string, { scale: string; position: string }> = {
  sacha: { scale: "scale-[1.1]", position: "50% 28%" },
  camille: { scale: "scale-[1.5]", position: "50% 33%" },
  claude: { scale: "scale-[1.45]", position: "50% 44%" },
};

const DEFAULT = { scale: "scale-100", position: "50% 30%" };

export function Avatar({
  id,
  alt = "",
  className = "",
}: {
  id: string;
  alt?: string;
  className?: string; // taille : ex. "h-14 w-14" / "h-6 w-6"
}) {
  const crop = CROP[id] ?? DEFAULT;
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-border ${className}`}
    >
      <Image
        src={`/visuels/avatar-${id}.jpg`}
        alt={alt}
        fill
        sizes="112px"
        className={`object-cover ${crop.scale}`}
        style={{ objectPosition: crop.position }}
      />
    </span>
  );
}
