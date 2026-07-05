import { Link } from 'react-router-dom';
import type { ShopProductListItem } from '@/user/lib/shop-catalog';
import ProductPrice from '@/user/components/ProductPrice';

interface ProductCardProps {
  product: ShopProductListItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm mb-3 bg-surface">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          loading="lazy"
        />
      </div>

      <h3 className="font-body text-sm font-medium text-foreground leading-tight mb-1.5 group-hover:text-accent-foreground transition-colors">
        {product.name}
      </h3>
      <ProductPrice
        sellingPrice={product.sellingPrice}
        mrp={product.mrp}
        currency={product.currency}
        size="md"
      />
    </Link>
  );
}
