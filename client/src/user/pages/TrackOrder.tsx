import Navbar from '@/user/components/Navbar';
import Footer from '@/user/components/Footer';
import AnnouncementBar from '@/user/components/AnnouncementBar';
import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, Clock, Package, Truck, Home } from 'lucide-react';

const mockOrders: Record<string, { status: number; email: string; items: string[] }> = {
  'SS-1001': { status: 4, email: 'priya@example.com', items: ['Silk Anarkali Kurta Set', 'Pashmina Shawl'] },
  'SS-1002': { status: 2, email: 'rahul@example.com', items: ["Men's Dhaka Print Shirt"] },
  'SS-1003': { status: 3, email: 'sita@example.com', items: ['Cotton Floral Midi Dress', 'Statement Jhumka Earrings'] },
};

const steps = [
  { icon: CheckCircle, label: 'Order Placed' },
  { icon: Clock, label: 'Confirmed' },
  { icon: Package, label: 'Processing' },
  { icon: Truck, label: 'Dispatched' },
  { icon: Home, label: 'Delivered' },
];

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<null | { status: number; items: string[] }>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const order = mockOrders[orderId.toUpperCase()];
    if (order && order.email === email) {
      setResult({ status: order.status, items: order.items });
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
      toast.error('No order found with these details');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl lg:text-5xl text-foreground mb-4">Track Your Order</h1>
            <p className="font-body text-sm text-muted-foreground">Enter your order details below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-12">
            <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="Order ID (e.g., SS-1001)" className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-background" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-background" />
            <button type="submit" className="w-full bg-foreground text-primary-foreground py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 transition-all">
              Track Order
            </button>
          </form>

          {notFound && (
            <div className="text-center p-8 border border-border rounded-sm">
              <p className="font-body text-sm text-muted-foreground">No order found with these details. Please check your Order ID and email.</p>
            </div>
          )}

          {result && (
            <div className="border border-border rounded-sm p-8">
              <h3 className="font-display text-xl text-foreground mb-2">Order {orderId.toUpperCase()}</h3>
              <p className="font-body text-xs text-muted-foreground mb-8">Items: {result.items.join(', ')}</p>

              <div className="relative">
                {steps.map((step, i) => {
                  const completed = i < result.status;
                  const current = i === result.status;
                  return (
                    <div key={step.label} className="flex items-center gap-4 mb-6 last:mb-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${completed ? 'bg-accent text-accent-foreground' : current ? 'bg-accent/20 text-accent ring-2 ring-accent' : 'bg-surface text-muted-foreground'}`}>
                        <step.icon size={18} />
                      </div>
                      <div>
                        <p className={`font-body text-sm ${completed || current ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                        {completed && <p className="font-body text-[11px] text-muted-foreground">Completed</p>}
                        {current && <p className="font-body text-[11px] text-accent">In progress</p>}
                      </div>
                    </div>
                  );
                })}
                <div className="absolute left-5 top-10 bottom-4 w-px bg-border -translate-x-1/2" />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}


