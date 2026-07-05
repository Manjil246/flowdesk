import { Truck, Award, Shield } from 'lucide-react';

const features = [
  {
    icon: Award,
    title: 'Ready-to-Wear',
    desc: "Contemporary women's pieces you can wear immediately — no tailoring required.",
  },
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    desc: 'We ship across Nepal from Chitwan. Delivery charges vary by product.',
  },
  {
    icon: Shield,
    title: "Women's Fashion",
    desc: "Our entire collection is curated for women — contemporary everyday styles you can wear immediately.",
  },
];

export default function FeaturesStrip() {
  return (
    <section className="bg-surface border-y border-border py-16 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 max-w-5xl">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="text-center">
            <Icon size={30} strokeWidth={1.2} className="mx-auto text-accent-foreground mb-4" />
            <h3 className="font-body text-sm font-semibold text-foreground mb-2 uppercase tracking-[1.5px]">
              {title}
            </h3>
            <p className="font-body text-xs text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
