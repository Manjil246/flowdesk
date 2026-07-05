import { Link } from 'react-router-dom';
import { Package, Heart, Shield, Truck } from 'lucide-react';

const perks = [
  { icon: Shield, label: 'Premium Quality' },
  { icon: Package, label: 'Carefully Packed' },
  { icon: Heart, label: 'Made with Love' },
  { icon: Truck, label: 'Delivery All Over Nepal' },
];

const steps = [
  'Place an order',
  'Receive a free Thank You card',
  'Collect 4 cards',
  'Get free delivery on your next order',
];

export default function ThankYouCardSection() {
  return (
    <section className="bg-background py-20 lg:py-24 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
          <div className="w-full lg:w-1/2">
            <p className="font-body text-[11px] uppercase tracking-[3px] font-medium text-accent-foreground mb-4">
              Loyalty Reward
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-light text-foreground mb-6 leading-[1.1]">
              Collect Thank You Cards,
              <br />
              <em className="italic">Earn Free Delivery</em>
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-[1.7] mb-6 max-w-lg">
              Every StyleSutra order includes a <strong className="text-foreground">free Thank You card</strong>.
              Keep them safe — when you collect <strong className="text-foreground">4 cards</strong>, your next
              order ships with <strong className="text-foreground">free delivery</strong>.
            </p>

            <ol className="space-y-3 mb-8 max-w-lg">
              {steps.map((step, i) => (
                <li key={step} className="flex items-start gap-3 font-body text-sm text-muted-foreground">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent-foreground font-semibold text-xs flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <p className="font-body text-xs text-muted-foreground mb-8">
              Keep your cards safe and start collecting today. Thank you for supporting our small business.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center bg-accent-dark text-primary-foreground px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-accent-dark/90 transition-all"
              >
                Start Collecting
              </Link>
              <a
                href="https://www.instagram.com/style_sutra3/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-foreground text-foreground px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-surface transition-all"
              >
                @style_sutra3
              </a>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col items-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 border border-accent/20 translate-x-3 translate-y-3 rounded-sm" />
              <img
                src="/thank-you-card.jpeg"
                alt="StyleSutra Thank You card — collect 4 for free delivery"
                className="relative w-full rounded-sm object-cover"
                loading="lazy"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 w-full max-w-md lg:max-w-none">
              {perks.map(({ icon: Icon, label }) => (
                <div key={label} className="text-center">
                  <Icon size={22} strokeWidth={1.2} className="mx-auto text-accent-foreground mb-2" />
                  <p className="font-body text-[10px] uppercase tracking-[1px] text-muted-foreground leading-snug">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
