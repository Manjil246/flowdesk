import type { ColorPresetDto } from "@/lib/product-colors";
import { toast } from "sonner";
import { colorNameMatches } from "@/lib/color-utils";
import { PresetColorBadges } from "@/components/catalog/PresetColorBadges";
import { CustomColorFields } from "@/components/catalog/CustomColorFields";

type ColorVariantPickerProps = {
  presets: ColorPresetDto[];
  usedColorNames: string[];
  colorName: string;
  hexCode: string;
  presetActive: boolean;
  onPresetSelect: (preset: ColorPresetDto) => void;
  onCustomColorNameChange: (name: string) => void;
  onCustomHexChange: (hex: string) => void;
  nameId?: string;
  hexId?: string;
};

export function ColorVariantPicker({
  presets,
  usedColorNames,
  colorName,
  hexCode,
  presetActive,
  onPresetSelect,
  onCustomColorNameChange,
  onCustomHexChange,
  nameId = "variant-color-name",
  hexId = "variant-color-hex",
}: ColorVariantPickerProps) {
  const availablePresets = presets.filter(
    (p) => !usedColorNames.some((n) => colorNameMatches(n, p.name)),
  );

  const handlePresetSelect = (preset: ColorPresetDto) => {
    if (usedColorNames.some((n) => colorNameMatches(n, preset.name))) {
      toast.message(`${preset.name} is already on this product`);
      return;
    }
    onPresetSelect(preset);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Preset colors</p>
        {availablePresets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            All presets are already added. Use a custom color below.
          </p>
        ) : (
          <div className="rounded-md border border-border/60 bg-muted/20 p-3">
            <PresetColorBadges
              presets={availablePresets}
              selectedNames={presetActive && colorName ? [colorName] : []}
              onSelect={handlePresetSelect}
            />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom color</p>
        <CustomColorFields
          colorName={colorName}
          hexCode={hexCode}
          onColorNameChange={onCustomColorNameChange}
          onHexCodeChange={onCustomHexChange}
          nameId={nameId}
          hexId={hexId}
        />
      </div>
    </div>
  );
}
