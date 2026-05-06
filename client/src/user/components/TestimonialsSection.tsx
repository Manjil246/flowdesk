import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Priya Sharma',
    city: 'Kathmandu',
    rating: 5,
    text: 'The quality of the Pashmina shawl exceeded every expectation. Packaging was beautiful and delivery was fast. StyleSutra is my go-to for gifting.',
    initial: 'P',
  },
  {
    name: 'Rahul Thapa',
    city: 'Pokhara',
    rating: 5,
    text: "Bought a Dhaka print shirt for dashain. Got so many compliments. The fabric is premium and the fit was perfect with the size guide.",
    initial: 'R',
  },
  {
    name: 'Sita Gurung',
    city: 'Lalitpur',
    rating: 4,
    text: "Love the collection and the website is so easy to use. Would love more options in plus sizes. Overall a great experience.",
    initial: 'S',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl lg:text-5xl font-normal text-foreground mb-4">What Our Customers Say</h2>
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
              <span className="font-display text-6xl text-accent-light absolute top-4 left-6 leading-none">"</span>
              <p className="font-body text-sm text-muted-foreground leading-[1.7] mt-10 mb-6">{t.text}</p>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className={j < t.rating ? 'fill-accent text-accent' : 'text-border'} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center font-body text-sm font-semibold text-accent">
                  {t.initial}
                </div>
                <div>
                  <p className="font-body text-sm font-medium text-foreground">{t.name}</p>
                  <p className="font-body text-[11px] text-muted-foreground">{t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-center font-body text-xs text-muted-foreground mt-8">Join 1,200+ Happy Customers</p>
      </div>
    </section>
  );
}


