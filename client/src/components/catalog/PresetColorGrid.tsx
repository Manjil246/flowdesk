import type { ColorPresetDto } from "@/lib/product-colors";
import {
  colorNameMatches,
  isLightSwatch,
  normalizeHexCode,
} from "@/lib/color-utils";

type PresetColorGridProps = {
  presets: ColorPresetDto[];
  selectedNames: string[];
  onSelect: (preset: ColorPresetDto) => void;
};

/** Compact scrollable swatch grid — one palette block, not repeated per card. */
export function PresetColorGrid({
  presets,
  selectedNames,
  onSelect,
}: PresetColorGridProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <p className="text-[11px] text-muted-foreground mb-2">
        Hover for name · click to select
      </p>
      <div className="max-h-[132px] overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
          {presets.map((preset) => {
            const selected = selectedNames.some((n) =>
              colorNameMatches(n, preset.name),
            );
            const light = isLightSwatch(preset.hexCode);
            return (
              <button
                key={preset.name}
                type="button"
                title={preset.name}
                aria-label={preset.name}
                aria-pressed={selected}
                onClick={() => onSelect(preset)}
                className={`mx-auto h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                  selected
                    ? "border-primary ring-2 ring-primary/25 scale-105"
                    : light
                      ? "border-border hover:border-primary/50"
                      : "border-transparent hover:border-foreground/30"
                }`}
                style={{
                  backgroundColor: normalizeHexCode(preset.hexCode),
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
