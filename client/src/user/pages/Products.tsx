import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/user/components/ProductCard';
import Navbar from '@/user/components/Navbar';
import Footer from '@/user/components/Footer';
import AnnouncementBar from '@/user/components/AnnouncementBar';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  fetchShopProductList,
  sortShopProducts,
} from '@/user/lib/shop-catalog';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const sort = params.get('sort') || 'featured';

  const productsQuery = useQuery({
    queryKey: ['shopProducts'],
    queryFn: fetchShopProductList,
  });

  const sorted = useMemo(() => {
    if (!productsQuery.data) return [];
    return sortShopProducts(productsQuery.data, sort);
  }, [productsQuery.data, sort]);

  const updateSort = (value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'featured') next.set('sort', value);
    else next.delete('sort');
    setParams(next);
  };

  const isLoading = productsQuery.isLoading;
  const loadError = productsQuery.error;

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <p className="font-body text-[11px] uppercase tracking-[3px] text-accent-foreground font-medium mb-2">
              Women's Ready-to-Wear
            </p>
            <h1 className="font-display text-4xl lg:text-5xl font-normal text-foreground mb-2">
              Shop
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {isLoading
                ? 'Loading collection…'
                : `Showing ${sorted.length} ${sorted.length === 1 ? 'piece' : 'pieces'}`}
            </p>
          </div>

          <div className="flex items-center justify-end mb-8 pb-4 border-b border-border">
            <select
              value={sort}
              onChange={(e) => updateSort(e.target.value)}
              className="font-body text-xs bg-transparent border border-border rounded-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading && (
            <div className="flex justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {loadError && (
            <div className="text-center py-20">
              <h3 className="font-display text-2xl text-foreground mb-3">
                Could not load products
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                {(loadError as Error).message}
              </p>
            </div>
          )}

          {!isLoading && !loadError && sorted.length === 0 && (
            <div className="text-center py-20">
              <h3 className="font-display text-2xl text-foreground mb-3">
                No products yet
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                New ready-to-wear pieces will appear here soon.
              </p>
            </div>
          )}

          {!isLoading && !loadError && sorted.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {sorted.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
