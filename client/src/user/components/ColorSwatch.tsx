import { isLightSwatch, normalizeHexCode } from "@/lib/color-utils";

type ColorSwatchProps = {
  hexCode: string;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
};

export default function ColorSwatch({
  hexCode,
  label,
  selected = false,
  disabled = false,
  onClick,
  size = "md",
}: ColorSwatchProps) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const light = isLightSwatch(hexCode);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={selected}
      className={`${dim} rounded-full border-2 transition-all shrink-0 ${
        selected
          ? "border-foreground ring-2 ring-foreground/20 ring-offset-2 ring-offset-background scale-105"
          : light
            ? "border-border hover:border-foreground/50"
            : "border-transparent hover:border-foreground/40"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      style={{ backgroundColor: normalizeHexCode(hexCode) }}
    />
  );
}
