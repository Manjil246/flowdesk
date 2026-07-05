import Navbar from '@/user/components/Navbar';
import Footer from '@/user/components/Footer';
import AnnouncementBar from '@/user/components/AnnouncementBar';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Clock, Loader2 } from 'lucide-react';
import { submitContactInquiry } from '@/lib/api/contact';
import { STORE_CONTACT } from '@/user/lib/store-contact';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      submitContactInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      }),
    onSuccess: () => {
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to send message. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    const phoneDigits = form.phone.replace(/\D/g, '').replace(/^977/, '');
    if (phoneDigits && !/^9\d{9}$/.test(phoneDigits)) {
      toast.error('Please enter a valid 10-digit phone number starting with 9');
      return;
    }
    submitMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl lg:text-5xl text-foreground mb-4">
            Contact Us
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            We&apos;d love to hear from you — call{' '}
            <a
              href={STORE_CONTACT.phoneTel}
              className="text-foreground font-medium hover:underline"
            >
              {STORE_CONTACT.phoneDisplay}
            </a>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-body text-xs font-medium text-foreground mb-2 block">
                Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-background"
              />
            </div>
            <div>
              <label className="font-body text-xs font-medium text-foreground mb-2 block">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-background"
              />
            </div>
            <div>
              <label className="font-body text-xs font-medium text-foreground mb-2 block">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="98XXXXXXXX"
                className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-background"
              />
            </div>
            <div>
              <label className="font-body text-xs font-medium text-foreground mb-2 block">
                Subject
              </label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-background"
              >
                <option value="">Select a subject</option>
                <option>Order Inquiry</option>
                <option>Product Question</option>
                <option>Return/Exchange</option>
                <option>Partnership</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="font-body text-xs font-medium text-foreground mb-2 block">
                Message *
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-background resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-foreground text-primary-foreground py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </form>

          <div className="space-y-8">
            {[
              {
                icon: Mail,
                label: 'Email',
                value: STORE_CONTACT.email,
                href: `mailto:${STORE_CONTACT.email}`,
              },
              {
                icon: Phone,
                label: 'Phone',
                value: STORE_CONTACT.phoneDisplay,
                href: STORE_CONTACT.phoneTel,
              },
              { icon: MapPin, label: 'Address', value: STORE_CONTACT.address },
              {
                icon: Clock,
                label: 'Business Hours',
                value: STORE_CONTACT.hours,
              },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4">
                <Icon size={20} strokeWidth={1.2} className="text-accent-foreground mt-0.5" />
                <div>
                  <h4 className="font-body text-sm font-medium text-foreground">
                    {label}
                  </h4>
                  {href ? (
                    <a
                      href={href}
                      className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="font-body text-sm text-muted-foreground">{value}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="mt-8">
              <img
                src="https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=600&h=300&fit=crop&q=80"
                alt="Chitwan, Nepal"
                className="w-full h-48 object-cover rounded-sm"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
