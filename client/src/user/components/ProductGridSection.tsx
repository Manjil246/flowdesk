import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { fetchShopProductList } from '@/user/lib/shop-catalog';
import { Loader2 } from 'lucide-react';

interface ProductGridSectionProps {
  title: string;
  subtitle: string;
  limit?: number;
}

export default function ProductGridSection({
  title,
  subtitle,
  limit = 8,
}: ProductGridSectionProps) {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['shopProducts'],
    queryFn: fetchShopProductList,
  });

  const visible = products.slice(0, limit);

  return (
    <section className="py-20 lg:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl lg:text-5xl font-normal text-foreground mb-4">
            {title}
          </h2>
          <div className="w-10 h-px bg-accent mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && visible.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {visible.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center justify-center border border-foreground text-foreground px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-surface transition-all"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
