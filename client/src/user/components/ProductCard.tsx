import { Link } from 'react-router-dom';
import { Product } from '@/user/data/products';
import { useCartStore } from '@/user/stores/cartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants[0];
    if (!variant) return;
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      image: product.images[0],
      size: variant.size,
      color: variant.color,
      price: variant.price,
      quantity: 1,
      maxStock: variant.stock,
    });
    toast.success('Added to cart');
    openCart();
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm mb-3 bg-surface">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          loading="lazy"
        />

        {/* Quick Add */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-0 left-0 right-0 bg-foreground/95 text-primary-foreground py-3 font-body text-[11px] font-semibold uppercase tracking-[1.5px] translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        >
          Quick Add
        </button>
      </div>

      <p className="font-body text-[10px] uppercase tracking-[1.5px] text-muted-foreground mb-1">{product.category}</p>
      <h3 className="font-body text-sm font-medium text-foreground leading-tight mb-1.5 group-hover:text-accent transition-colors">{product.name}</h3>
      <span className="font-body text-base font-semibold text-foreground">रू {product.basePrice.toLocaleString()}</span>
    </Link>
  );
}


