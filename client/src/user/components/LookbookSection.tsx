import { Link } from 'react-router-dom';

export default function LookbookSection() {
  return (
    <section className="bg-surface py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
          <div className="w-full lg:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=700&h=900&fit=crop&q=80"
              alt="StyleSutra ready-to-wear"
              className="w-full h-[400px] lg:h-[560px] object-cover rounded-sm"
            />
          </div>
          <div className="w-full lg:w-1/2 lg:pl-8">
            <p className="font-body text-[11px] uppercase tracking-[3px] font-medium text-accent-foreground mb-4">
              The Edit
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-light text-foreground mb-6 leading-[1.1]">
              Ready-to-Wear,
              <br />
              Made Simple
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-[1.7] mb-8 max-w-md">
              StyleSutra is women's contemporary fashion from Chitwan — pieces you
              can wear straight away. We focus on clean silhouettes, wearable colours,
              and fits that work for real life — ready-to-wear designed for women.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center bg-accent-dark text-primary-foreground px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-accent-dark/90 transition-all"
            >
              Shop the Collection
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
          {[
            {
              src: '/lookbook-01.jpg',
              h: 'h-[250px] lg:h-[320px]',
            },
            {
              src: '/lookbook-02.jpg',
              h: 'h-[300px] lg:h-[380px]',
            },
            {
              src: '/lookbook-03.jpg',
              h: 'h-[220px] lg:h-[300px]',
            },
          ].map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt="StyleSutra women's fashion"
              className={`w-full ${img.h} object-cover rounded-sm`}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
