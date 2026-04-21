import { Link } from 'react-router-dom';
import { products } from '@/user/data/products';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

interface ProductGridSectionProps {
  title: string;
  subtitle: string;
  productIds?: string[];
  featured?: boolean;
  limit?: number;
}

export default function ProductGridSection({ title, subtitle, productIds, featured, limit = 8 }: ProductGridSectionProps) {
  let filtered = productIds
    ? products.filter(p => productIds.includes(p.id))
    : featured
      ? products.filter(p => p.isFeatured)
      : products;

  filtered = filtered.slice(0, limit);

  // If not enough featured, pad with other products
  if (filtered.length < limit) {
    const remaining = products.filter(p => !filtered.find(f => f.id === p.id));
    filtered = [...filtered, ...remaining].slice(0, limit);
  }

  return (
    <section className="py-20 lg:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl lg:text-5xl font-normal text-foreground mb-4">{title}</h2>
          <div className="w-10 h-px bg-accent mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {filtered.map((product, i) => (
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


