import { Link } from 'react-router-dom';

export default function NewsletterSection() {
  return (
    <section className="bg-foreground py-20 lg:py-24 px-4">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="lg:w-1/2">
          <h2 className="font-display text-3xl lg:text-4xl italic font-light text-primary-foreground mb-3">
            Ready-to-Wear from Chitwan
          </h2>
          <p className="font-body text-sm text-primary-foreground/60">
            Women's contemporary fashion — wear it today, love it tomorrow.
          </p>
        </div>
        <div className="lg:w-1/2 flex gap-3 w-full max-w-md">
          <Link
            to="/products"
            className="flex-1 px-6 py-3 bg-accent-dark text-primary-foreground font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-accent-dark/90 transition-colors text-center"
          >
            Shop Now
          </Link>
          <Link
            to="/about"
            className="flex-1 px-6 py-3 border border-primary-foreground/30 text-primary-foreground font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-primary-foreground/10 transition-colors text-center"
          >
            Our Story
          </Link>
        </div>
      </div>
      <p className="container mx-auto mt-4 font-body text-[11px] text-primary-foreground/40 text-center lg:text-right">
        StyleSutra · Women's ready-to-wear only · Established 2025
      </p>
    </section>
  );
}
