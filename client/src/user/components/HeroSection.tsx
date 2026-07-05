import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Truck, Shirt } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="min-h-[calc(100vh-100px)] flex flex-col lg:flex-row items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full lg:w-[55%] flex flex-col justify-center px-6 lg:pl-[8%] lg:pr-12 py-10 lg:py-0"
      >
        <p className="font-body text-[11px] uppercase tracking-[3px] font-medium text-accent-foreground mb-6">
          Women's Ready-to-Wear · Est. 2025 · Chitwan
        </p>
        <h1 className="font-display text-5xl lg:text-7xl xl:text-[80px] font-light leading-[0.92] text-foreground mb-6">
          Dress the Story
          <br />
          <em className="italic">You Want to Tell</em>
        </h1>
        <p className="font-body text-[15px] text-muted-foreground leading-[1.7] max-w-lg mb-8">
          StyleSutra is a women's ready-to-wear label from Chitwan — easy,
          contemporary pieces for work, weekends, and everything in between —
          clothes you can wear straight out of the bag.
        </p>
        <div className="flex flex-wrap gap-4 mb-10">
          <Link
            to="/products"
            className="inline-flex items-center justify-center bg-foreground text-primary-foreground px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 active:scale-[0.97] transition-all"
          >
            Shop Ready-to-Wear
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center justify-center border border-foreground text-foreground px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-surface transition-all"
          >
            Our Story
          </Link>
        </div>
        <div className="flex flex-wrap gap-6 text-muted-foreground">
          {[
            { icon: Shirt, text: 'Women Only' },
            { icon: Sparkles, text: 'Ready-to-Wear' },
            { icon: Truck, text: 'Nationwide Delivery' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={14} className="text-accent-foreground" />
              <span className="font-body text-[11px] uppercase tracking-[1px]">
                {text}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full lg:w-[45%] relative flex items-center justify-center pb-10 pt-4 lg:py-16"
      >
        <div className="relative">
          <div className="absolute inset-0 border border-accent/20 translate-x-3 translate-y-3 rounded-sm" />
          <img
            src="/homepage-hero.jpg"
            alt="StyleSutra women's ready-to-wear"
            className="relative w-[320px] lg:w-[420px] h-[400px] lg:h-[540px] object-cover rounded-sm"
          />
        </div>
      </motion.div>
    </section>
  );
}
