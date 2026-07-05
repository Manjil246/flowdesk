import { productPriceDisplay } from '@/user/lib/product-pricing';

type ProductPriceProps = {
  sellingPrice: number;
  mrp?: number | null;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClasses = {
  sm: { sale: 'text-sm', original: 'text-xs' },
  md: { sale: 'text-base', original: 'text-sm' },
  lg: { sale: 'text-2xl', original: 'text-base' },
};

export default function ProductPrice({
  sellingPrice,
  mrp,
  currency = 'NPR',
  size = 'md',
  className = '',
}: ProductPriceProps) {
  const { sellingPrice: sale, mrp: originalMrp, onSale } =
    productPriceDisplay(sellingPrice, mrp);
  const s = sizeClasses[size];

  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}>
      <span className={`font-body font-semibold text-foreground ${s.sale}`}>
        {currency} {sale.toLocaleString()}
      </span>
      {onSale && originalMrp != null && (
        <span
          className={`font-body text-muted-foreground line-through ${s.original}`}
        >
          {currency} {originalMrp.toLocaleString()}
        </span>
      )}
    </div>
  );
}
