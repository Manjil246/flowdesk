import { Link } from 'react-router-dom';

export default function NewsletterSection() {
  return (
    <section className="bg-foreground py-20 lg:py-24 px-4">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="lg:w-1/2">
          <h2 className="font-display text-3xl lg:text-4xl italic font-light text-primary-foreground mb-3">
            Crafted in Nepal, Styled for You
          </h2>
          <p className="font-body text-sm text-primary-foreground/60">
            Discover timeless silhouettes, artisan textures, and everyday elegance.
          </p>
        </div>
        <div className="lg:w-1/2 flex gap-3 w-full max-w-md">
          <Link
            to="/products"
            className="flex-1 px-6 py-3 bg-accent text-accent-foreground font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-accent-dark transition-colors text-center"
          >
            Explore Collection
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
        Handpicked designs. Quality fabrics. Fair artisan craftsmanship.
      </p>
    </section>
  );
}


