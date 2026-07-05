import { useState } from 'react';
import { Star, User } from 'lucide-react';
import { motion } from 'framer-motion';

type Testimonial = {
  name: string;
  city: string;
  rating: number;
  text: string;
  /** Optional profile photo URL */
  avatarUrl?: string;
};

const testimonials: Testimonial[] = [
  {
    name: 'Priya Sharma',
    city: 'Bharatpur, Chitwan',
    rating: 5,
    text: 'Love that everything is ready-to-wear — I ordered a co-ord set and wore it the next day. Quality feels great for the price.',
  },
  {
    name: 'Anjali K.C.',
    city: 'Kathmandu',
    rating: 5,
    text: "Finally a women's shop that stays focused. No clutter, just clean everyday pieces. Delivery was quick too.",
  },
  {
    name: 'Sita Gurung',
    city: 'Pokhara',
    rating: 4,
    text: 'The size guide helped a lot. Would love even more dress options, but overall a smooth shopping experience.',
  },
];

function ReviewAvatar({
  name,
  avatarUrl,
}: Pick<Testimonial, 'name' | 'avatarUrl'>) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = avatarUrl?.trim();
  const showPhoto = Boolean(src) && !imgFailed;

  if (showPhoto && src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-9 w-9 shrink-0 rounded-full object-cover border border-border"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div
      className="h-9 w-9 shrink-0 rounded-full border border-border bg-accent/10 flex items-center justify-center text-accent-foreground"
      aria-hidden
    >
      <User size={16} strokeWidth={1.5} />
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl lg:text-5xl font-normal text-foreground mb-4">
            What Our Customers Say
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-background border border-border rounded-sm p-6 relative"
            >
              <span className="font-display text-6xl text-accent-light absolute top-4 left-6 leading-none">
                "
              </span>
              <p className="font-body text-sm text-muted-foreground leading-[1.7] mt-10 mb-6">
                {t.text}
              </p>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className={
                      j < t.rating ? 'fill-accent-foreground text-accent-foreground' : 'text-border'
                    }
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <ReviewAvatar name={t.name} avatarUrl={t.avatarUrl} />
                <div>
                  <p className="font-body text-sm font-medium text-foreground">
                    {t.name}
                  </p>
                  <p className="font-body text-[11px] text-muted-foreground">
                    {t.city}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
