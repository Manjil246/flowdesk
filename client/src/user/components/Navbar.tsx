import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/user/stores/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from '@/user/components/BrandLogo';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
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

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

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
        <BrandLogo fillHeight />

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

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={openCart}
            className="p-2 text-foreground rounded-full transition-colors relative hover:bg-secondary hover:text-primary"
            aria-label="Open cart"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-foreground text-primary-foreground text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {mobileOpen && (
              <>
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 z-100 bg-foreground/40"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="fixed inset-y-0 right-0 z-101 flex w-full max-w-sm flex-col border-l border-border bg-card shadow-2xl"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Navigation menu"
                >
                  <div className="flex h-16 items-stretch justify-between border-b border-border bg-card px-4">
                    <BrandLogo fillHeight onClick={() => setMobileOpen(false)} />
                    <button
                      onClick={() => setMobileOpen(false)}
                      aria-label="Close menu"
                      className="self-center rounded-full p-2 hover:bg-secondary"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <nav className="flex flex-1 flex-col gap-1 overflow-y-auto bg-card p-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.label}
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-sm border-b border-border/60 px-2 py-4 font-display text-3xl font-light text-foreground transition-colors hover:bg-secondary"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </header>
  );
}
