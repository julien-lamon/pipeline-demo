import { companyInitials, logoColor } from "@/lib/format";

export function LogoMark({
  name,
  size = "md",
}: {
  name: string;
  size?: "md" | "lg";
}) {
  const dims = size === "lg" ? "h-14 w-14 text-lg" : "h-11 w-11 text-sm";
  return (
    <div
      className={`flex ${dims} shrink-0 items-center justify-center rounded-xl font-bold ${logoColor(name)}`}
      aria-hidden
    >
      {companyInitials(name)}
    </div>
  );
}
