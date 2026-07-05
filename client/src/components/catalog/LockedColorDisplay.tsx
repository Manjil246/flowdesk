import { isValidHexCode, normalizeHexCode } from "@/lib/color-utils";

type LockedColorDisplayProps = {
  colorName: string;
  hexCode: string;
  size?: "sm" | "md";
};

export function LockedColorDisplay({
  colorName,
  hexCode,
  size = "md",
}: LockedColorDisplayProps) {
  const swatch = size === "sm" ? "h-4 w-4" : "h-8 w-8";
  const safeHex = isValidHexCode(hexCode) ? normalizeHexCode(hexCode) : "#888888";

  return (
    <div className="flex items-center gap-3">
      <span
        className={`${swatch} rounded-full border border-border shrink-0`}
        style={{ backgroundColor: safeHex }}
        aria-hidden
      />
      <div className="min-w-0">
        <p className={`font-medium ${size === "sm" ? "text-sm" : "text-base"}`}>
          {colorName}
        </p>
        <p className="text-xs text-muted-foreground font-mono">{safeHex}</p>
      </div>
    </div>
  );
}
