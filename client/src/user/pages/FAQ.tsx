import Navbar from '@/user/components/Navbar';
import Footer from '@/user/components/Footer';
import AnnouncementBar from '@/user/components/AnnouncementBar';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  {
    section: 'Ordering',
    items: [
      { q: 'How do I place an order?', a: 'Browse our collections, select your size and color, add items to your cart, and proceed to checkout. You can pay using eSewa, Khalti, or FonePay.' },
      { q: 'Can I modify my order after placing it?', a: 'You can modify your order within 1 hour of placing it by contacting us at hello@stylesutra.com.np. After that, the order enters processing and cannot be changed.' },
      { q: 'Is there a minimum order value?', a: 'No minimum order value is required — you can shop any single item you love.' },
    ]
  },
  {
    section: 'Shipping & Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Kathmandu Valley: 2–4 business days. Other major cities: 4–7 business days. Remote areas: 7–10 business days.' },
      { q: 'Do you deliver outside Kathmandu?', a: 'Yes! We deliver across all 7 provinces of Nepal.' },
      { q: 'How much does shipping cost?', a: 'Delivery charges depend on the product — some items include free delivery, while others have a set delivery fee shown on the product page.' },
    ]
  },
  {
    section: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept eSewa, Khalti, and FonePay. Available options are shown at checkout.' },
      { q: 'Is online payment secure?', a: 'Absolutely. All transactions are encrypted and processed through secure payment gateways. We never store your payment credentials.' },
    ]
  },
  {
    section: 'Products & Sizing',
    items: [
      { q: 'How do I find my size?', a: 'Check our Size Guide page for detailed measurements in both CM and inches. Each product also has specific fit notes.' },
      { q: 'Are the product colors accurate?', a: 'We make every effort to display colors as accurately as possible. However, slight variations may occur due to screen settings and lighting conditions during photography.' },
      { q: 'What does StyleSutra sell?', a: 'We sell women\'s ready-to-wear clothing — contemporary pieces you can wear straight away, from tops and dresses to co-ords and casual separates.' },
    ]
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="font-body text-sm font-medium text-foreground">{q}</span>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <p className="font-body text-sm text-muted-foreground leading-[1.7] pb-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl lg:text-5xl text-foreground mb-4">Frequently Asked Questions</h1>
          <p className="font-body text-sm text-muted-foreground">Everything you need to know</p>
        </div>
        <div className="max-w-2xl mx-auto space-y-10">
          {faqData.map((section) => (
            <div key={section.section}>
              <h2 className="font-display text-xl text-foreground mb-4">{section.section}</h2>
              {section.items.map((item) => <FaqItem key={item.q} {...item} />)}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}


