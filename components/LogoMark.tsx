import { companyInitials } from "@/lib/format";

// Logo entreprise en initiales, monochrome chaud (charte : pas de palette
// multi-couleurs ; un seul point chaud corail par écran, qui n'est pas ici).
export function LogoMark({
  name,
  size = "md",
}: {
  name: string;
  size?: "md" | "lg";
}) {
  const dims = size === "lg" ? "h-14 w-14 text-base" : "h-11 w-11 text-sm";
  return (
    <div
      className={`flex ${dims} shrink-0 items-center justify-center rounded-xl bg-surface font-semibold text-muted ring-1 ring-border`}
      aria-hidden
    >
      {companyInitials(name)}
    </div>
  );
}
