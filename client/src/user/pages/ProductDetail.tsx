import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/user/stores/cartStore';
import Navbar from '@/user/components/Navbar';
import Footer from '@/user/components/Footer';
import AnnouncementBar from '@/user/components/AnnouncementBar';
import { Minus, Plus, Truck, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { fetchShopProduct } from '@/user/lib/shop-catalog';
import ProductPrice from '@/user/components/ProductPrice';
import ProductImageGallery from '@/user/components/ProductImageGallery';
import ColorSwatch from '@/user/components/ColorSwatch';
import { scaledMrp } from '@/user/lib/product-pricing';

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['shopProduct', productId],
    queryFn: () => fetchShopProduct(productId!),
    enabled: Boolean(productId),
  });

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setSelectedColorIndex(0);
    setSelectedSizeIndex(0);
    setQuantity(1);
  }, [productId, product?.id]);

  const selectedColor = product?.colors[selectedColorIndex];
  const selectedSize = selectedColor?.sizes[selectedSizeIndex];

  const displaySellingPrice = selectedSize?.price ?? product?.sellingPrice ?? 0;
  const displayMrp =
    product != null
      ? scaledMrp(displaySellingPrice, product.sellingPrice, product.mrp)
      : null;

  const galleryImages = useMemo(
    () =>
      product?.colors.map((color) => ({
        src: color.imageUrl,
        alt: `${product?.name ?? 'Product'} — ${color.colorName}`,
      })) ?? [],
    [product],
  );

  const sizesForSelectedColor = useMemo(
    () => selectedColor?.sizes ?? [],
    [selectedColor],
  );

  useEffect(() => {
    if (selectedSizeIndex >= sizesForSelectedColor.length) {
      setSelectedSizeIndex(0);
    }
  }, [selectedSizeIndex, sizesForSelectedColor.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="font-display text-4xl mb-4">Product Not Found</h1>
          <Link to="/products" className="text-accent-foreground underline">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const hasFreeDelivery = product.freeDelivery || product.deliveryCharge === 0;

  const formatMoney = (amount: number) =>
    `रू ${amount.toLocaleString('en-NP', { maximumFractionDigits: 0 })}`;

  const handleAddToCart = (goCheckout = false) => {
    if (!selectedColor || !selectedSize) {
      toast.error('Please select a color and size');
      return;
    }
    if (selectedSize.stock <= 0) {
      toast.error('This size is out of stock');
      return;
    }
    addItem({
      productId: product.id,
      colorId: selectedColor.id,
      variantId: selectedSize.stockId,
      name: product.name,
      image: selectedColor.imageUrl,
      size: selectedSize.size,
      color: selectedColor.colorName,
      price: selectedSize.price,
      quantity,
      maxStock: selectedSize.stock,
      freeDelivery: hasFreeDelivery,
      deliveryCharge: hasFreeDelivery ? 0 : product.deliveryCharge,
    });
    toast.success('Added to cart');
    if (goCheckout) {
      navigate('/checkout');
    } else {
      openCart();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8 font-body text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-foreground">
              Shop
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative lg:overflow-visible"
            >
              <ProductImageGallery
                images={galleryImages}
                selectedIndex={selectedColorIndex}
                onSelectIndex={(index) => {
                  setSelectedColorIndex(index);
                  setSelectedSizeIndex(0);
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <p className="font-body text-[10px] uppercase tracking-[2px] text-accent-foreground font-medium mb-2">
                {product.categoryName}
              </p>
              <h1 className="font-display text-3xl lg:text-4xl font-normal text-foreground leading-[1.2] mb-3">
                {product.name}
              </h1>

              <div className="mb-6">
                <ProductPrice
                  sellingPrice={displaySellingPrice}
                  mrp={displayMrp ?? product.mrp}
                  currency={product.currency}
                  size="lg"
                />
                <p className="font-body text-[11px] text-muted-foreground mt-1">
                  Ready-to-wear · Inclusive of all taxes
                </p>
                {hasFreeDelivery ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-sm border border-success/30 bg-success/10 px-3 py-2">
                    <Truck
                      size={15}
                      strokeWidth={1.5}
                      className="text-success shrink-0"
                      aria-hidden
                    />
                    <span className="font-body text-xs font-semibold text-success">
                      Free delivery on this item
                    </span>
                  </div>
                ) : (
                  <p className="font-body text-xs text-muted-foreground mt-3">
                    Delivery charge:{' '}
                    <span className="font-medium text-foreground">
                      {formatMoney(product.deliveryCharge)}
                    </span>{' '}
                    nationwide
                  </p>
                )}
              </div>

              {selectedSize && (
                <p
                  className={`font-body text-xs font-medium mb-4 ${
                    selectedSize.stock <= 5 ? 'text-cta' : 'text-success'
                  }`}
                >
                  {selectedSize.stock <= 0
                    ? 'Out of stock'
                    : selectedSize.stock <= 5
                      ? `Only ${selectedSize.stock} left!`
                      : 'In Stock'}
                </p>
              )}

              <div className="mb-6">
                <p className="font-body text-xs font-medium text-foreground mb-3">
                  Color —{' '}
                  <span className="text-muted-foreground">
                    {selectedColor?.colorName}
                  </span>
                </p>
                <div className="flex flex-wrap gap-3 items-center">
                  {product.colors.map((color, i) => (
                    <ColorSwatch
                      key={color.id}
                      hexCode={color.hexCode}
                      label={color.colorName}
                      selected={selectedColorIndex === i}
                      onClick={() => {
                        setSelectedColorIndex(i);
                        setSelectedSizeIndex(0);
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="font-body text-xs font-medium text-foreground mb-3">
                  Size —{' '}
                  <span className="text-muted-foreground">
                    {selectedSize?.size ?? '—'}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizesForSelectedColor.map((sizeOption, i) => {
                    const out = sizeOption.stock <= 0;
                    return (
                      <button
                        key={sizeOption.stockId}
                        type="button"
                        disabled={out}
                        onClick={() => setSelectedSizeIndex(i)}
                        className={`min-w-[44px] h-10 px-3 border rounded-sm font-body text-xs font-medium transition-all ${
                          selectedSizeIndex === i
                            ? 'border-foreground bg-foreground text-primary-foreground'
                            : out
                              ? 'border-border text-muted-foreground/40 cursor-not-allowed line-through'
                              : 'border-border text-foreground hover:border-foreground'
                        }`}
                      >
                        {sizeOption.size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <p className="font-body text-xs font-medium text-foreground mb-3">
                  Quantity
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-border rounded-sm flex items-center justify-center hover:border-foreground transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-body text-sm font-medium w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        Math.min(selectedSize?.stock || 20, quantity + 1),
                      )
                    }
                    className="w-10 h-10 border border-border rounded-sm flex items-center justify-center hover:border-foreground transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  className="w-full bg-foreground text-primary-foreground py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 active:scale-[0.97] transition-all"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  className="w-full border border-foreground text-foreground py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-surface transition-all"
                >
                  Buy Now
                </button>
              </div>

              <div className="border border-border rounded-sm p-4 space-y-3">
                {hasFreeDelivery ? (
                  <div className="flex items-start gap-3 rounded-sm border border-success/25 bg-success/5 px-3 py-3">
                    <Truck
                      size={18}
                      strokeWidth={1.5}
                      className="text-success flex-shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <div>
                      <p className="font-body text-sm font-semibold text-success">
                        Free delivery
                      </p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">
                        No delivery charge on this product
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Truck
                      size={16}
                      strokeWidth={1.2}
                      className="text-accent-foreground flex-shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">
                        Delivery charge
                      </p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">
                        {formatMoney(product.deliveryCharge)} — estimated 2–4 days in
                        Chitwan &amp; nearby, 4–7 days elsewhere in Nepal
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Shield
                    size={16}
                    strokeWidth={1.2}
                    className="text-accent-foreground flex-shrink-0"
                    aria-hidden
                  />
                  <span className="font-body text-xs text-muted-foreground">
                    {hasFreeDelivery
                      ? 'Estimated 2–4 days in Chitwan & nearby, 4–7 days elsewhere in Nepal'
                      : 'Secure checkout · Pay with eSewa, Khalti, or FonePay'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-16 border-t border-border pt-12">
            <h2 className="font-display text-2xl text-foreground mb-4">
              Description
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-[1.7] max-w-2xl">
              {product.description || 'No description provided yet.'}
            </p>
            {(product.fabric || product.occasions.length > 0) && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.fabric ? (
                  <span className="px-3 py-1 bg-surface rounded-sm font-body text-[11px] uppercase tracking-[1px] text-muted-foreground">
                    {product.fabric}
                  </span>
                ) : null}
                {product.occasions.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-surface rounded-sm font-body text-[11px] uppercase tracking-[1px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
