import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import type { ProductPickerOption } from "@/lib/catalog-picker";
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

function ProductThumb({
  imageUrl,
  name,
  className,
}: {
  imageUrl: string;
  name: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={cn("rounded-md object-cover border border-border shrink-0", className)}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={cn(
        "rounded-md border border-dashed border-muted-foreground/30 bg-muted flex items-center justify-center text-[10px] text-muted-foreground text-center px-1 shrink-0",
        className,
      )}
      aria-hidden
    >
      No image
    </div>
  );
}

function ProductPickerRow({
  product,
  compact = false,
}: {
  product: ProductPickerOption;
  compact?: boolean;
}) {
  const thumb = compact ? "h-8 w-8" : "h-12 w-12";
  return (
    <div className="flex items-center gap-3 min-w-0">
      <ProductThumb imageUrl={product.imageUrl} name={product.name} className={thumb} />
      <div className="min-w-0 flex-1 text-left">
        <p className={cn("font-medium truncate", compact ? "text-sm" : "text-sm")}>
          {product.name}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {product.currency} {product.sellingPrice.toLocaleString()}
          {product.mrp > product.sellingPrice ? (
            <span className="ml-1.5 line-through opacity-70">
              {product.currency} {product.mrp.toLocaleString()}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

type ProductPickerProps = {
  products: ProductPickerOption[];
  value: string;
  onValueChange: (productId: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ProductPicker({
  products,
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select product",
}: ProductPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = products.find((p) => p.id === value);

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
            <ProductPickerRow product={selected} compact />
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,420px)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search products…" />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.name} ${product.id}`}
                  onSelect={() => {
                    onValueChange(product.id);
                    setOpen(false);
                  }}
                  className="py-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === product.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <ProductPickerRow product={product} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
