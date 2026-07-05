import Navbar from '@/user/components/Navbar';
import Footer from '@/user/components/Footer';
import AnnouncementBar from '@/user/components/AnnouncementBar';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle, Clock, Loader2, Package, Truck, XCircle } from 'lucide-react';
import {
  CUSTOMER_ORDER_STEPS,
  customerOrderStepIndex,
  trackWebOrder,
  type TrackedWebOrder,
} from '@/user/lib/shop-orders';

const stepIcons = [Clock, CheckCircle, Truck, Package];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderReference, setOrderReference] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<TrackedWebOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('orderReference') ?? '';
    const em = searchParams.get('email') ?? '';
    if (ref) setOrderReference(ref);
    if (em) setEmail(em);
    if (ref && em) {
      void (async () => {
        setLoading(true);
        try {
          const order = await trackWebOrder(ref, em);
          setResult(order);
          setNotFound(false);
        } catch {
          setResult(null);
          setNotFound(true);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderReference.trim() || !email.trim()) {
      toast.error('Please enter your order ID and email');
      return;
    }

    setLoading(true);
    setNotFound(false);
    try {
      const order = await trackWebOrder(orderReference, email);
      setResult(order);
    } catch {
      setResult(null);
      setNotFound(true);
      toast.error('No order found with these details');
    } finally {
      setLoading(false);
    }
  };

  const activeStep = result ? customerOrderStepIndex(result.status) : -1;
  const isCancelled = result?.status === 'cancelled';

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl lg:text-5xl text-foreground mb-4">Track Your Order</h1>
            <p className="font-body text-sm text-muted-foreground">
              Enter your order ID and the email you used at checkout
            </p>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 mb-12">
            <input
              value={orderReference}
              onChange={(e) => setOrderReference(e.target.value)}
              placeholder="Order ID (e.g., SS-20250704-ABC123)"
              className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-background"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-background"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-primary-foreground py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              Track Order
            </button>
          </form>

          {notFound && (
            <div className="text-center p-8 border border-border rounded-sm">
              <p className="font-body text-sm text-muted-foreground">
                No order found with these details. Please check your Order ID and email.
              </p>
            </div>
          )}

          {result && (
            <div className="border border-border rounded-sm p-8 space-y-6">
              <div>
                <h3 className="font-display text-xl text-foreground">{result.orderReference}</h3>
                <p className="font-body text-xs text-muted-foreground mt-1">
                  Placed {result.placedAt ? new Date(result.placedAt).toLocaleString() : '—'}
                </p>
              </div>

              <div className="rounded-sm border border-border bg-surface/40 px-4 py-3">
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">Current status</p>
                <p className="font-body text-base font-semibold text-foreground mt-1">{result.statusLabel}</p>
                {result.status === 'pending' && (
                  <p className="font-body text-xs text-muted-foreground mt-2 leading-relaxed">
                    Our team is reviewing your order. We will contact you shortly to confirm details.
                  </p>
                )}
              </div>

              {isCancelled ? (
                <div className="flex items-start gap-3 rounded-sm border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <XCircle size={18} className="text-destructive shrink-0 mt-0.5" />
                  <p className="font-body text-sm text-muted-foreground">
                    This order was cancelled. Contact us if you have questions.
                  </p>
                </div>
              ) : (
                <div className="relative pl-1">
                  {CUSTOMER_ORDER_STEPS.map((step, i) => {
                    const Icon = stepIcons[i] ?? Clock;
                    const completed = i < activeStep;
                    const current = i === activeStep;
                    return (
                      <div key={step.key} className="flex items-start gap-4 mb-6 last:mb-0 relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            completed
                              ? 'bg-accent text-accent-foreground'
                              : current
                                ? 'bg-accent/20 text-accent-foreground ring-2 ring-accent-foreground'
                                : 'bg-surface text-muted-foreground border border-border'
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="pt-1.5">
                          <p className={`font-body text-sm ${completed || current ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                          {completed && <p className="font-body text-[11px] text-muted-foreground">Completed</p>}
                          {current && <p className="font-body text-[11px] text-accent-foreground">Current step</p>}
                        </div>
                      </div>
                    );
                  })}
                  <div className="absolute left-5 top-5 bottom-6 w-px bg-border" />
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-border">
                <p className="font-body text-xs font-medium text-foreground uppercase tracking-wide">Items</p>
                {result.lineItems.map((item, i) => (
                  <div key={i} className="flex justify-between font-body text-sm gap-4">
                    <span className="text-muted-foreground">
                      {item.productName} · {item.colorName} · {item.size} × {item.quantity}
                    </span>
                    <span className="shrink-0">रू {Number(item.lineTotal).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-2 border-t border-border font-body text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>रू {Number(result.itemsSubtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>{result.deliveryCharge === 0 ? 'Free' : `रू ${Number(result.deliveryCharge).toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-foreground pt-1">
                  <span>Total</span>
                  <span>रू {Number(result.grandTotal).toLocaleString()}</span>
                </div>
              </div>

              <div className="font-body text-xs text-muted-foreground leading-relaxed">
                Delivering to: <span className="text-foreground">{result.deliveryLocation}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
