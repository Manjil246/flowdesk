import { Truck, Award, Shield } from 'lucide-react';

const features = [
  { icon: Award, title: 'Quality Assured', desc: 'Every piece hand-picked by our fashion curators for craft and authenticity.' },
  { icon: Truck, title: 'Nationwide Delivery', desc: 'Flat रू 150 delivery to every district in Nepal — no surprises at checkout.' },
  { icon: Shield, title: 'Secure Payment', desc: 'eSewa, Khalti, FonePay, and Cash on Delivery — all encrypted end-to-end.' },
];

export default function FeaturesStrip() {
  return (
    <section className="bg-surface border-y border-border py-16 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 max-w-5xl">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="text-center">
            <Icon size={30} strokeWidth={1.2} className="mx-auto text-accent mb-4" />
            <h3 className="font-body text-sm font-semibold text-foreground mb-2 uppercase tracking-[1.5px]">{title}</h3>
            <p className="font-body text-xs text-muted-foreground leading-relaxed max-w-[260px] mx-auto">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


