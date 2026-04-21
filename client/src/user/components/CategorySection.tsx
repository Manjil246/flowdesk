import { Link } from 'react-router-dom';
import { categories } from '@/user/data/products';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function CategorySection() {
  return (
    <section className="py-20 lg:py-28 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-14">
          <p className="font-body text-[11px] uppercase tracking-[3px] text-accent font-medium mb-3">Collections</p>
          <h2 className="font-display text-4xl lg:text-5xl font-normal text-foreground mb-4">Shop By Category</h2>
          <div className="w-12 h-px bg-accent mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: 'easeOut' }}
            >
              <Link
                to={`/products?category=${cat.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-sm"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent group-hover:from-foreground/80 transition-colors duration-500" />
                <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-background/85 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  <ArrowUpRight size={16} className="text-foreground" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <p className="font-body text-[10px] uppercase tracking-[2px] text-primary-foreground/70 mb-2">
                    {cat.itemCount} curated pieces
                  </p>
                  <h3 className="font-display text-2xl lg:text-3xl text-primary-foreground">{cat.name}</h3>
                  <div className="mt-3 inline-flex items-center gap-2 text-primary-foreground font-body text-[11px] uppercase tracking-[1.5px] border-b border-primary-foreground/40 pb-1">
                    Explore Collection
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


