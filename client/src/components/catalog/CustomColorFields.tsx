import { ColorHexField } from "@/components/catalog/ColorHexField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CustomColorFieldsProps = {
  colorName: string;
  hexCode: string;
  onColorNameChange: (value: string) => void;
  onHexCodeChange: (value: string) => void;
  nameId?: string;
  hexId?: string;
};

export function CustomColorFields({
  colorName,
  hexCode,
  onColorNameChange,
  onHexCodeChange,
  nameId = "custom-color-name",
  hexId = "custom-color-hex",
}: CustomColorFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={nameId}>Color name</Label>
        <Input
          id={nameId}
          value={colorName}
          onChange={(e) => onColorNameChange(e.target.value)}
          placeholder="e.g. Parrot Green"
        />
      </div>
      <ColorHexField
        id={hexId}
        label="Hex color"
        value={hexCode}
        onChange={onHexCodeChange}
      />
    </>
  );
}
