import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCartStore } from '@/user/stores/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Women', href: '/products?category=women' },
  { label: 'Men', href: '/products?category=men' },
  { label: 'Accessories', href: '/products?category=accessories' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{ top: 'var(--announcement-height, 0px)' }}
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-background border-b border-border shadow-sm'
          : 'bg-background/95 backdrop-blur-xl'
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="font-display text-xl sm:text-2xl tracking-[2px] sm:tracking-[3px] font-semibold text-foreground">
          STYLESUTRA
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="font-body text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={openCart} className="p-2 hover:text-accent transition-colors relative" aria-label="Open cart">
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-foreground text-primary-foreground text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button className="hidden lg:block p-2 hover:text-accent transition-colors" aria-label="Account">
            <User size={18} />
          </button>
          <button className="lg:hidden p-2" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed inset-0 bg-background z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-display text-xl tracking-[2px] font-semibold">STYLESUTRA</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={24} /></button>
            </div>
            <div className="flex flex-col p-8 gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-3xl font-light text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


