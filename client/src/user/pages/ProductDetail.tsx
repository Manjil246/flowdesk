import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { products } from '@/user/data/products';
import { useCartStore } from '@/user/stores/cartStore';
import Navbar from '@/user/components/Navbar';
import Footer from '@/user/components/Footer';
import AnnouncementBar from '@/user/components/AnnouncementBar';
import { Minus, Plus, Star, Truck, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const { slug } = useParams();
  const product = products.find(p => p.slug === slug);
  const addItem = useCartStore(s => s.addItem);
  const openCart = useCartStore(s => s.openCart);

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl mb-4">Product Not Found</h1>
          <Link to="/products" className="text-accent underline">Back to Products</Link>
        </div>
      </div>
    );
  }

  const colors = [...new Map(product.variants.map(v => [v.color, { name: v.color, hex: v.colorHex }])).values()];
  const sizesForColor = product.variants.filter(v => v.color === colors[selectedColor]?.name).map(v => v.size);
  const allSizes = [...new Set(product.variants.map(v => v.size))];
  const currentVariant = product.variants.find(v => v.color === colors[selectedColor]?.name && v.size === allSizes[selectedSize]);

  const handleAddToCart = () => {
    if (!currentVariant) { toast.error('Please select size and color'); return; }
    addItem({
      productId: product.id,
      variantId: currentVariant.id,
      name: product.name,
      image: product.images[0],
      size: currentVariant.size,
      color: currentVariant.color,
      price: currentVariant.price,
      quantity,
      maxStock: currentVariant.stock,
    });
    toast.success('Added to cart');
    openCart();
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 font-body text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to={`/products?category=${product.categoryId}`} className="hover:text-foreground">{product.category}</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Images */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <div className="aspect-[4/5] overflow-hidden rounded-sm mb-4 group cursor-zoom-in">
                <img
                  src={product.images[mainImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.15]"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, i) => (
                    <button key={i} onClick={() => setMainImage(i)} className={`w-16 h-20 rounded-sm overflow-hidden border-2 transition-colors ${mainImage === i ? 'border-accent' : 'border-transparent'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <p className="font-body text-[10px] uppercase tracking-[2px] text-accent font-medium mb-2">StyleSutra Exclusive</p>
              <h1 className="font-display text-3xl lg:text-4xl font-normal text-foreground leading-[1.2] mb-3">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-border'} />
                  ))}
                </div>
                <span className="font-body text-xs text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="font-body text-2xl font-semibold text-foreground">रू {product.basePrice.toLocaleString()}</span>
                <p className="font-body text-[11px] text-muted-foreground mt-1">Inclusive of all taxes</p>
              </div>

              {/* Stock */}
              {currentVariant && (
                <p className={`font-body text-xs font-medium mb-4 ${currentVariant.stock <= 5 ? 'text-cta' : 'text-success'}`}>
                  {currentVariant.stock <= 5 ? `Only ${currentVariant.stock} left!` : 'In Stock'}
                </p>
              )}

              {/* Color */}
              <div className="mb-6">
                <p className="font-body text-xs font-medium text-foreground mb-3">
                  Color — <span className="text-muted-foreground">{colors[selectedColor]?.name}</span>
                </p>
                <div className="flex gap-2">
                  {colors.map((color, i) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(i)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === i ? 'border-foreground scale-110' : 'border-border'}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-6">
                <p className="font-body text-xs font-medium text-foreground mb-3">
                  Size — <span className="text-muted-foreground">{allSizes[selectedSize]}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((size, i) => {
                    const available = sizesForColor.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => available && setSelectedSize(i)}
                        className={`min-w-[44px] h-10 px-3 border rounded-sm font-body text-xs font-medium transition-all ${
                          selectedSize === i ? 'border-foreground bg-foreground text-primary-foreground' :
                          available ? 'border-border text-foreground hover:border-foreground' :
                          'border-border text-muted-foreground/40 cursor-not-allowed line-through'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <p className="font-body text-xs font-medium text-foreground mb-3">Quantity</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border border-border rounded-sm flex items-center justify-center hover:border-foreground transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="font-body text-sm font-medium w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(currentVariant?.stock || 20, quantity + 1))} className="w-10 h-10 border border-border rounded-sm flex items-center justify-center hover:border-foreground transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 mb-8">
                <button onClick={handleAddToCart} className="w-full bg-foreground text-primary-foreground py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 active:scale-[0.97] transition-all">
                  Add to Cart
                </button>
                <Link to="/checkout" onClick={handleAddToCart} className="w-full block text-center border border-foreground text-foreground py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-surface transition-all">
                  Buy Now
                </Link>
              </div>

              {/* Delivery info */}
              <div className="border border-border rounded-sm p-4 space-y-3">
                {[
                  { icon: Truck, text: 'Delivery charge: रू 150 across Nepal' },
                  { icon: Shield, text: 'Estimated 2–4 days in Kathmandu Valley, 4–7 days elsewhere' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon size={16} strokeWidth={1.2} className="text-accent flex-shrink-0" />
                    <span className="font-body text-xs text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Description */}
          <div className="mt-16 border-t border-border pt-12">
            <h2 className="font-display text-2xl text-foreground mb-4">Description</h2>
            <p className="font-body text-sm text-muted-foreground leading-[1.7] max-w-2xl">{product.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-surface rounded-sm font-body text-[11px] uppercase tracking-[1px] text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}


