import Navbar from '@/user/components/Navbar';
import Footer from '@/user/components/Footer';
import AnnouncementBar from '@/user/components/AnnouncementBar';
import { motion } from 'framer-motion';
import { Heart, Gem, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />

      <div className="relative h-[400px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1400&h=500&fit=crop&q=80"
          alt="StyleSutra"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
          <h1 className="font-display text-5xl lg:text-6xl text-primary-foreground font-light">
            About Us
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <p className="font-body text-[11px] uppercase tracking-[3px] text-accent-foreground mb-4">
            Our Story
          </p>
          <h2 className="font-display text-4xl font-light text-foreground mb-8">
            Women's Ready-to-Wear from Chitwan
          </h2>
          <div className="font-body text-sm text-muted-foreground leading-[1.8] space-y-4">
            <p>
              StyleSutra was founded in <strong className="text-foreground">2025</strong> in{' '}
              <strong className="text-foreground">Chitwan, Nepal</strong> with one clear focus:
              ready-to-wear clothing for women. We wanted a shop where you can pick a piece,
              try it on, and wear it the same day — no custom tailoring, no long waits.
            </p>
            <p>
              Our collection is built for everyday life: tops, dresses, co-ords, and casual
              separates that feel current and comfortable. StyleSutra is women's contemporary
              fashion — ready-to-wear you can put on the same day.
            </p>
            <p>
              Every item is chosen for fit, fabric, and how it actually works in a real wardrobe.
              Whether you are dressing for college, office, or a coffee run in Tandi, we aim
              to make getting dressed simple.
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: Heart,
              title: 'Ready-to-Wear',
              desc: 'Clothes you can wear immediately — thoughtfully selected fits and fabrics for daily wear.',
            },
            {
              icon: Gem,
              title: 'Women Only',
              desc: "Our entire catalog is designed for women — contemporary everyday styles for real life.",
            },
            {
              icon: Users,
              title: 'Rooted in Chitwan',
              desc: 'Born locally in 2025, serving customers across Nepal with reliable delivery and honest pricing.',
            },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-8"
            >
              <Icon size={32} strokeWidth={1.2} className="mx-auto text-accent-foreground mb-4" />
              <h3 className="font-display text-2xl text-foreground mb-3">{title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-[1.7]">{desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center py-12 border-t border-border">
          <h3 className="font-display text-2xl text-foreground mb-4">
            Explore the Collection
          </h3>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Browse all our women's ready-to-wear pieces in one place.
          </p>
          <Link
            to="/products"
            className="inline-flex bg-foreground text-primary-foreground px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 transition-all"
          >
            Shop Now
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
