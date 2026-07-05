import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { isValidHexCode, normalizeHexCode } from "@/lib/color-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ColorVariantOption = {
  id: string;
  colorName: string;
  hexCode: string;
  imageUrl: string;
};

function ColorVariantRow({
  color,
  compact = false,
}: {
  color: ColorVariantOption;
  compact?: boolean;
}) {
  const thumb = compact ? "h-8 w-8" : "h-12 w-12";
  const hex = isValidHexCode(color.hexCode)
    ? normalizeHexCode(color.hexCode)
    : "#888888";

  return (
    <div className="flex items-center gap-3 min-w-0">
      {color.imageUrl ? (
        <img
          src={color.imageUrl}
          alt=""
          className={cn(
            "rounded-md object-cover border border-border shrink-0",
            thumb,
          )}
          loading="lazy"
        />
      ) : (
        <span
          className={cn("rounded-full border border-border shrink-0", thumb)}
          style={{ backgroundColor: hex }}
          aria-hidden
        />
      )}
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-medium truncate">{color.colorName}</p>
        <p className="text-xs text-muted-foreground font-mono">{hex}</p>
      </div>
    </div>
  );
}

type ColorVariantSelectProps = {
  colors: ColorVariantOption[];
  value: string;
  onValueChange: (colorId: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ColorVariantSelect({
  colors,
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select color",
}: ColorVariantSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = colors.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between h-auto min-h-10 py-2 font-normal"
        >
          {selected ? (
            <ColorVariantRow color={selected} compact />
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,360px)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search colors…" />
          <CommandList>
            <CommandEmpty>No colors found.</CommandEmpty>
            <CommandGroup>
              {colors.map((color) => (
                <CommandItem
                  key={color.id}
                  value={`${color.colorName} ${color.id}`}
                  onSelect={() => {
                    onValueChange(color.id);
                    setOpen(false);
                  }}
                  className="py-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === color.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <ColorVariantRow color={color} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
