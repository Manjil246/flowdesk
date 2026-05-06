import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Sparkles, Gem, ChevronDown } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="min-h-[calc(100vh-100px)] flex flex-col lg:flex-row items-center">
      {/* Left content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full lg:w-[55%] flex flex-col justify-center px-6 lg:pl-[8%] lg:pr-12 py-16 lg:py-0 order-2 lg:order-1"
      >
        <p className="font-body text-[11px] uppercase tracking-[3px] font-medium text-accent mb-6">
          New Collection — Spring 2025
        </p>
        <h1 className="font-display text-5xl lg:text-7xl xl:text-[80px] font-light leading-[0.92] text-foreground mb-6">
          Dress the Story<br />
          <em className="italic">You Want to Tell</em>
        </h1>
        <p className="font-body text-[15px] text-muted-foreground leading-[1.7] max-w-lg mb-8">
          Curated fashion from Nepal's finest designers. Timeless pieces crafted with intention and worn with pride.
        </p>
        <div className="flex flex-wrap gap-4 mb-10">
          <Link
            to="/products"
            className="inline-flex items-center justify-center bg-foreground text-primary-foreground px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 active:scale-[0.97] transition-all"
          >
            Explore Collection
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center justify-center border border-foreground text-foreground px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-surface transition-all"
          >
            Our Story
          </Link>
        </div>
        <div className="flex gap-6 text-muted-foreground">
          {[
            { icon: Sparkles, text: 'Hand-Curated' },
            { icon: Gem, text: 'Authentic Crafts' },
            { icon: Truck, text: 'Nationwide Delivery' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={14} className="text-accent" />
              <span className="font-body text-[11px] uppercase tracking-[1px]">{text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full lg:w-[45%] relative flex items-center justify-center py-8 lg:py-16 order-1 lg:order-2"
      >
        <div className="relative">
          <div className="absolute inset-0 border border-accent/20 translate-x-3 translate-y-3 rounded-sm" />
          <img
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=560&h=700&fit=crop&q=80"
            alt="StyleSutra fashion editorial"
            className="relative w-[320px] lg:w-[420px] h-[400px] lg:h-[540px] object-cover rounded-sm"
            style={{ filter: 'sepia(0.05)' }}
          />
          <div className="absolute inset-0 bg-accent/[0.06] rounded-sm pointer-events-none" />
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block"
        >
          <ChevronDown size={20} className="text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
}


