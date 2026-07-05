import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hexForColorInput, isValidHexCode, normalizeHexCode } from "@/lib/color-utils";

type ColorHexFieldProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (hexCode: string) => void;
};

export function ColorHexField({
  id = "color-hex",
  label = "Hex color",
  value,
  onChange,
}: ColorHexFieldProps) {
  const safePicker = hexForColorInput(value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-3">
        <input
          id={`${id}-picker`}
          type="color"
          value={safePicker}
          onChange={(e) => onChange(normalizeHexCode(e.target.value))}
          className="h-10 w-12 cursor-pointer rounded-md border border-border bg-background p-1"
          aria-label={`${label} picker`}
        />
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            if (!value.trim()) return;
            try {
              onChange(normalizeHexCode(value));
            } catch {
              /* keep raw until save validation */
            }
          }}
          placeholder="#7b1fa2"
          className="font-mono text-sm max-w-[140px]"
          spellCheck={false}
        />
        <span
          className="h-9 w-9 shrink-0 rounded-full border border-border"
          style={{
            backgroundColor: isValidHexCode(value)
              ? normalizeHexCode(value)
              : "#e5e5e5",
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}
