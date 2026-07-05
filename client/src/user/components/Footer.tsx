import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
import BrandLogo from '@/user/components/BrandLogo';

export default function Footer() {
  return (
    <footer className="bg-surface-2 pt-16 pb-8 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-1">
            <BrandLogo className="block" />
            <p className="font-body text-xs text-muted-foreground leading-relaxed mt-3 mb-4">
              Women's ready-to-wear from Chitwan, Nepal — contemporary pieces made
              for everyday confidence.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/style_sutra3/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="StyleSutra on Instagram"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground transition-colors hover:border-primary hover:bg-background hover:text-primary"
              >
                <Instagram size={14} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61579372212592"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="StyleSutra on Facebook"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground transition-colors hover:border-primary hover:bg-background hover:text-primary"
              >
                <Facebook size={14} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-body text-[11px] font-semibold uppercase tracking-[1.5px] text-foreground mb-4">
              Shop
            </h4>
            {[
              { label: 'All Products', to: '/products' },
              { label: 'About Us', to: '/about' },
              { label: 'Contact', to: '/contact' },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block font-body text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <h4 className="font-body text-[11px] font-semibold uppercase tracking-[1.5px] text-foreground mb-4">
              Company
            </h4>
            {[
              { label: 'About Us', to: '/about' },
              { label: 'Contact', to: '/contact' },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block font-body text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <h4 className="font-body text-[11px] font-semibold uppercase tracking-[1.5px] text-foreground mb-4">
              Help
            </h4>
            {[
              { label: 'FAQ', to: '/faq' },
              { label: 'Shipping Policy', to: '/shipping-policy' },
              { label: 'Size Guide', to: '/size-guide' },
              { label: 'Track Your Order', to: '/track-order' },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block font-body text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="font-body text-[11px] text-muted-foreground">
            © 2025 StyleSutra. All rights reserved.
          </p>
          <p className="font-body text-[11px] text-muted-foreground">
            Est. 2025 · Chitwan, Nepal
          </p>
        </div>
      </div>
    </footer>
  );
}
