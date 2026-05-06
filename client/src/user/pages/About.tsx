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

      {/* Hero */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1400&h=500&fit=crop&q=80"
          alt="StyleSutra workshop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
          <h1 className="font-display text-5xl lg:text-6xl text-primary-foreground font-light">About Us</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        {/* Story */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center mb-20">
          <p className="font-body text-[11px] uppercase tracking-[3px] text-accent mb-4">Our Story</p>
          <h2 className="font-display text-4xl font-light text-foreground mb-8">Born in Nepal, Made for the World</h2>
          <div className="font-body text-sm text-muted-foreground leading-[1.8] space-y-4">
            <p>StyleSutra was born from a deep love for Nepal's rich textile heritage and a vision to bring it to the modern world. Founded in Kathmandu in 2023, we set out to bridge the gap between traditional Nepali craftsmanship and contemporary fashion sensibilities.</p>
            <p>Every piece in our collection tells a story — of artisans who have perfected their craft over generations, of fabrics that carry the warmth of the Himalayas, and of designs that honor tradition while embracing the future.</p>
            <p>We work directly with over 50 artisan communities across Nepal, ensuring fair wages, sustainable practices, and the preservation of dying art forms like Dhaka weaving and Pashmina crafting.</p>
          </div>
        </motion.div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: Heart, title: 'Quality', desc: 'Every piece is hand-selected by our fashion curators. We believe in fewer, better things that last beyond seasons.' },
            { icon: Gem, title: 'Authenticity', desc: 'We work directly with artisan communities to preserve traditional techniques like Dhaka weaving and hand embroidery.' },
            { icon: Users, title: 'Community', desc: 'Supporting over 50 artisan families across Nepal. Fair wages, sustainable practices, and stories worth sharing.' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-8">
              <Icon size={32} strokeWidth={1.2} className="mx-auto text-accent mb-4" />
              <h3 className="font-display text-2xl text-foreground mb-3">{title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-[1.7]">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Team */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl text-foreground mb-8">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { name: 'Anisha Rai', title: 'Founder & Creative Director', seed: 'anisha' },
              { name: 'Bijay Shrestha', title: 'Head of Operations', seed: 'bijay' },
              { name: 'Mina Tamang', title: 'Head of Design', seed: 'mina' },
            ].map((member) => (
              <div key={member.name} className="text-center">
                <img src={`https://picsum.photos/seed/${member.seed}/200/200`} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
                <h4 className="font-body text-sm font-semibold text-foreground">{member.name}</h4>
                <p className="font-body text-xs text-muted-foreground">{member.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12 border-t border-border">
          <h3 className="font-display text-2xl text-foreground mb-4">Join Our Journey</h3>
          <p className="font-body text-sm text-muted-foreground mb-6">Explore our latest collection and timeless essentials.</p>
          <Link to="/products" className="inline-flex bg-foreground text-primary-foreground px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 transition-all">
            Shop Collection
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}


