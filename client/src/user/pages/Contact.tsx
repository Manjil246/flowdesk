import Navbar from '@/user/components/Navbar';
import Footer from '@/user/components/Footer';
import AnnouncementBar from '@/user/components/AnnouncementBar';
import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl lg:text-5xl text-foreground mb-4">Contact Us</h1>
          <p className="font-body text-sm text-muted-foreground">We'd love to hear from you</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-body text-xs font-medium text-foreground mb-2 block">Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-background" />
            </div>
            <div>
              <label className="font-body text-xs font-medium text-foreground mb-2 block">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-background" />
            </div>
            <div>
              <label className="font-body text-xs font-medium text-foreground mb-2 block">Subject</label>
              <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-background">
                <option value="">Select a subject</option>
                <option>Order Inquiry</option>
                <option>Product Question</option>
                <option>Return/Exchange</option>
                <option>Partnership</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="font-body text-xs font-medium text-foreground mb-2 block">Message *</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={5} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-background resize-none" />
            </div>
            <button type="submit" className="w-full bg-foreground text-primary-foreground py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 transition-all">
              Send Message
            </button>
          </form>

          <div className="space-y-8">
            {[
              { icon: Mail, label: 'Email', value: 'hello@stylesutra.com.np' },
              { icon: Phone, label: 'Phone', value: '+977-01-4XXXXXX' },
              { icon: MapPin, label: 'Address', value: 'Thamel, Kathmandu, Nepal' },
              { icon: Clock, label: 'Business Hours', value: 'Sun–Fri: 10 AM – 6 PM NPT' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <Icon size={20} strokeWidth={1.2} className="text-accent mt-0.5" />
                <div>
                  <h4 className="font-body text-sm font-medium text-foreground">{label}</h4>
                  <p className="font-body text-sm text-muted-foreground">{value}</p>
                </div>
              </div>
            ))}
            <div className="mt-8">
              <img src="https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=600&h=300&fit=crop&q=80" alt="Kathmandu" className="w-full h-48 object-cover rounded-sm" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


