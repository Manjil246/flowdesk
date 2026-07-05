import type { ColorPresetDto } from "@/lib/product-colors";
import {
  colorNameMatches,
  isLightSwatch,
  normalizeHexCode,
} from "@/lib/color-utils";

type PresetColorBadgesProps = {
  presets: ColorPresetDto[];
  selectedNames: string[];
  onSelect: (preset: ColorPresetDto) => void;
};

export function PresetColorBadges({
  presets,
  selectedNames,
  onSelect,
}: PresetColorBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => {
        const selected = selectedNames.some((n) =>
          colorNameMatches(n, preset.name),
        );
        const light = isLightSwatch(preset.hexCode);
        return (
          <button
            key={preset.name}
            type="button"
            onClick={() => onSelect(preset)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-normal transition-colors cursor-pointer ${
              selected
                ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/40"
            }`}
            aria-pressed={selected}
          >
            <span
              className={`h-4 w-4 rounded-full shrink-0 ${light ? "border border-border/70" : "border border-black/10"}`}
              style={{ backgroundColor: normalizeHexCode(preset.hexCode) }}
              aria-hidden
            />
            {preset.name}
          </button>
        );
      })}
    </div>
  );
}
