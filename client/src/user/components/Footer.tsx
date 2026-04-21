import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-2 pt-16 pb-8 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="font-display text-xl tracking-[3px] font-semibold text-foreground mb-3">STYLESUTRA</h3>
            <p className="font-body text-xs text-muted-foreground leading-relaxed mb-4">
              Curated fashion from Nepal's finest designers.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-colors">
                <Instagram size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-colors">
                <Facebook size={14} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-body text-[11px] font-semibold uppercase tracking-[1.5px] text-foreground mb-4">Shop</h4>
            {[
              { label: 'Home', to: '/' },
              { label: 'Women', to: '/products?category=women' },
              { label: 'Men', to: '/products?category=men' },
              { label: 'Accessories', to: '/products?category=accessories' },
            ].map(link => (
              <Link key={link.label} to={link.to} className="block font-body text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <h4 className="font-body text-[11px] font-semibold uppercase tracking-[1.5px] text-foreground mb-4">Company</h4>
            {[
              { label: 'About Us', to: '/about' },
              { label: 'Contact', to: '/contact' },
            ].map(link => (
              <Link key={link.label} to={link.to} className="block font-body text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Help */}
          <div>
            <h4 className="font-body text-[11px] font-semibold uppercase tracking-[1.5px] text-foreground mb-4">Help</h4>
            {[
              { label: 'FAQ', to: '/faq' },
              { label: 'Shipping Policy', to: '/shipping-policy' },
              { label: 'Size Guide', to: '/size-guide' },
              { label: 'Track Your Order', to: '/track-order' },
            ].map(link => (
              <Link key={link.label} to={link.to} className="block font-body text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="font-body text-[11px] text-muted-foreground">© 2026 StyleSutra. All rights reserved.</p>
          <p className="font-body text-[11px] text-muted-foreground">Designed with ♥ in Nepal</p>
        </div>
      </div>
    </footer>
  );
}


