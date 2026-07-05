import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/user/stores/cartStore';
import Navbar from '@/user/components/Navbar';
import Footer from '@/user/components/Footer';
import AnnouncementBar from '@/user/components/AnnouncementBar';
import { toast } from 'sonner';
import {
  Check,
  ChevronRight,
  MapPin,
  Loader2,
  Navigation,
  Phone,
  Clock,
  Copy,
  Bookmark,
} from 'lucide-react';
import { formatShippingAmount } from '@/user/stores/cartStore';
import { motion } from 'framer-motion';
import {
  emptyCheckoutAddress,
  formatDeliveryLocation,
  NEPAL_PROVINCES,
  type CheckoutAddress,
  type CheckoutLocation,
} from '@/user/lib/checkout-location';
import {
  formatCoords,
  GeolocationError,
  mapsLink,
  requestDeviceLocation,
} from '@/user/lib/geolocation';
import { reverseGeocodeFromApi } from '@/user/lib/shop-geocode';
import {
  createWebOrder,
  type CreateWebOrderResult,
} from '@/user/lib/shop-orders';

export default function Checkout() {
  const { items, getSubtotal, getShipping, getTotal, clearCart } = useCartStore();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<CheckoutAddress>(emptyCheckoutAddress);
  const [location, setLocation] = useState<CheckoutLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<CreateWebOrderResult | null>(null);

  const handleUseMyLocation = async () => {
    setLocationLoading(true);
    try {
      const coords = await requestDeviceLocation();
      const geo = await reverseGeocodeFromApi(coords.lat, coords.lng);

      setLocation({
        lat: coords.lat,
        lng: coords.lng,
        locationVerified: true,
        displayName: geo.displayName,
      });
      setAddress((prev) => ({
        ...prev,
        street: geo.street || geo.displayName || prev.street,
        city: geo.city || prev.city,
        district: geo.district || prev.district,
        province: geo.province || prev.province,
        zipCode: geo.zipCode || prev.zipCode,
      }));
      toast.success('Location captured — review your address below');
    } catch (err) {
      const message =
        err instanceof GeolocationError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Could not get your location';
      toast.error(message);
    } finally {
      setLocationLoading(false);
    }
  };

  const validateAddress = () => {
    if (!address.firstName || !address.lastName || !address.phone || !address.email) {
      toast.error('Please fill in your contact details');
      return false;
    }
    if (!/^9\d{9}$/.test(address.phone)) {
      toast.error('Please enter a valid 10-digit phone number starting with 9');
      return false;
    }
    if (!address.street || !address.province || !address.city) {
      toast.error('Please complete your delivery address');
      return false;
    }
    if (!location?.locationVerified) {
      toast.error('Tap "Use my location" so we can deliver to the right place');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (items.some((item) => !item.colorId)) {
      toast.error('Please remove old cart items and add products again before ordering');
      return;
    }

    setSubmitting(true);
    try {
      const order = await createWebOrder({
        firstName: address.firstName.trim(),
        lastName: address.lastName.trim(),
        email: address.email.trim(),
        phone: address.phone.trim(),
        street: address.street.trim(),
        city: address.city.trim(),
        district: address.district.trim(),
        province: address.province.trim(),
        zipCode: address.zipCode.trim(),
        notes: address.notes.trim(),
        deliveryLocationLat: location?.lat ?? null,
        deliveryLocationLng: location?.lng ?? null,
        locationVerified: Boolean(location?.locationVerified),
        items: items.map((item) => ({
          productId: item.productId,
          colorId: item.colorId,
          size: item.size,
          quantity: item.quantity,
        })),
      });
      setConfirmedOrder(order);
      clearCart();
      setStep(2);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyOrderId = async (orderReference: string) => {
    try {
      await navigator.clipboard.writeText(orderReference);
      toast.success('Order ID copied to clipboard');
    } catch {
      toast.error('Could not copy — please select and copy the ID manually');
    }
  };

  const deliverySummary = formatDeliveryLocation(address);
  const stepLabels = ['Delivery', 'Review', 'Confirmation'];

  if (items.length === 0 && step < 2) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar /><Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Your cart is empty</h1>
          <Link to="/products" className="inline-flex bg-foreground text-primary-foreground px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm">Start Shopping</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-2 mb-12">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold font-body ${i <= step ? 'bg-foreground text-primary-foreground' : 'bg-surface text-muted-foreground'}`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`font-body text-xs ${i <= step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
              {i < 2 && <ChevronRight size={14} className="text-muted-foreground mx-2" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="grid lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="font-display text-2xl text-foreground">Delivery details</h2>

              <div className="rounded-sm border border-border p-4 space-y-3 bg-surface/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-body text-sm font-medium text-foreground">Delivery location</p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      Allow location access so we can deliver to the right address.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleUseMyLocation()}
                    disabled={locationLoading}
                    className="inline-flex items-center justify-center gap-2 shrink-0 bg-foreground text-primary-foreground px-4 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[1px] rounded-sm hover:bg-foreground/85 transition-all disabled:opacity-60"
                  >
                    {locationLoading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                    Use my location
                  </button>
                </div>

                {location?.locationVerified ? (
                  <div className="rounded-sm border border-success/30 bg-success/5 px-3 py-3 space-y-1">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-success shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-body text-xs font-semibold text-success">Location captured</p>
                        <p className="font-body text-xs text-muted-foreground mt-0.5 break-words">
                          {location.displayName || deliverySummary}
                        </p>
                        <p className="font-body text-[11px] text-muted-foreground font-mono mt-1">
                          {formatCoords(location.lat, location.lng)}
                        </p>
                        <a
                          href={mapsLink(location.lat, location.lng)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-body text-[11px] text-accent-foreground hover:underline inline-block mt-1"
                        >
                          View on map
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="font-body text-xs text-muted-foreground">
                    Location not set yet — tap the button above when you are at your delivery address.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs font-medium text-foreground mb-1 block">First Name *</label>
                  <input value={address.firstName} onChange={(e) => setAddress({ ...address, firstName: e.target.value })} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="font-body text-xs font-medium text-foreground mb-1 block">Last Name *</label>
                  <input value={address.lastName} onChange={(e) => setAddress({ ...address, lastName: e.target.value })} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="font-body text-xs font-medium text-foreground mb-1 block">Phone *</label>
                <input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="98XXXXXXXX" className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="font-body text-xs font-medium text-foreground mb-1 block">Email *</label>
                <input type="email" value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>

              <div>
                <label className="font-body text-xs font-medium text-foreground mb-1 block">Street Address *</label>
                <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs font-medium text-foreground mb-1 block">Province *</label>
                  <select value={address.province} onChange={(e) => setAddress({ ...address, province: e.target.value })} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="">Select Province</option>
                    {NEPAL_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-body text-xs font-medium text-foreground mb-1 block">City *</label>
                  <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs font-medium text-foreground mb-1 block">District</label>
                  <input value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="font-body text-xs font-medium text-foreground mb-1 block">Zip code</label>
                  <input value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} placeholder="44204" className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>

              <div>
                <label className="font-body text-xs font-medium text-foreground mb-1 block">Delivery notes</label>
                <textarea value={address.notes} onChange={(e) => setAddress({ ...address, notes: e.target.value })} rows={3} placeholder="Any instructions for delivery?" className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
              </div>

              <button onClick={() => validateAddress() && setStep(1)} className="w-full bg-foreground text-primary-foreground py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 transition-all">
                Continue to Review
              </button>
            </div>

            <OrderSummarySidebar
              items={items}
              location={location}
              getSubtotal={getSubtotal}
              getShipping={getShipping}
              getTotal={getTotal}
            />
          </div>
        )}

        {step === 1 && (
          <div className="grid lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="font-display text-2xl text-foreground">Review your order</h2>

              <div className="rounded-sm border border-accent/30 bg-accent/5 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-accent-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-body text-sm font-medium text-foreground">What happens next?</p>
                    <p className="font-body text-sm text-muted-foreground mt-1 leading-relaxed">
                      After you place your order, our team will review it. We will contact you shortly at{' '}
                      <span className="text-foreground font-medium">{address.phone}</span> or{' '}
                      <span className="text-foreground font-medium">{address.email}</span> to confirm details and payment.
                      No online payment is required right now.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-border bg-surface/50 px-4 py-4 space-y-2 font-body text-sm">
                <p className="text-muted-foreground">
                  Delivering to{' '}
                  <span className="text-foreground font-medium">{deliverySummary}</span>
                </p>
                <p className="text-muted-foreground">
                  Contact: {address.firstName} {address.lastName} · {address.phone}
                </p>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(0)} className="flex-1 border border-foreground text-foreground py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-surface transition-colors">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => void handlePlaceOrder()}
                  disabled={submitting}
                  className="flex-1 bg-foreground text-primary-foreground py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Placing order…
                    </>
                  ) : (
                    'Place order'
                  )}
                </button>
              </div>
            </div>

            <OrderSummarySidebar
              items={items}
              location={location}
              getSubtotal={getSubtotal}
              getShipping={getShipping}
              getTotal={getTotal}
            />
          </div>
        )}

        {step === 2 && confirmedOrder && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto py-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check size={32} className="text-success" />
              </div>
              <h2 className="font-display text-3xl text-foreground mb-2">Thank you for your order!</h2>
              <p className="font-body text-sm text-muted-foreground">
                Your order has been submitted and is pending review.
              </p>
            </div>

            <div className="rounded-sm border-2 border-accent bg-accent/5 p-6 mb-6 text-center shadow-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 mb-4">
                <Bookmark size={14} className="text-accent-foreground" />
                <span className="font-body text-[11px] font-semibold uppercase tracking-[1.5px] text-accent-foreground">
                  Save this order ID
                </span>
              </div>
              <p className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Your order ID
              </p>
              <p className="font-display text-2xl sm:text-3xl text-foreground tracking-wide break-all select-all">
                {confirmedOrder.orderReference}
              </p>
              <button
                type="button"
                onClick={() => void handleCopyOrderId(confirmedOrder.orderReference)}
                className="mt-4 inline-flex items-center gap-2 border border-foreground/20 bg-background px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-[1px] rounded-sm hover:bg-surface transition-colors"
              >
                <Copy size={14} />
                Copy order ID
              </button>
              <p className="font-body text-sm text-foreground mt-5 leading-relaxed max-w-md mx-auto">
                Please keep this order ID somewhere safe. You will need it along with your email to track your order status anytime.
              </p>
            </div>

            <div className="rounded-sm border border-border bg-surface/50 px-5 py-5 space-y-3 mb-8">
              <p className="inline-flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                <Clock size={12} />
                Current status: <span className="text-foreground font-semibold">Pending review</span>
              </p>
              <p className="font-body text-sm text-foreground leading-relaxed">
                Our team will review your order and contact you shortly at{' '}
                <span className="font-medium">{address.phone}</span> or{' '}
                <span className="font-medium">{address.email}</span> to confirm details and payment.
              </p>
              <p className="font-body text-sm text-muted-foreground">
                Estimated total:{' '}
                <span className="text-foreground font-medium">
                  {confirmedOrder.currency} {confirmedOrder.grandTotal.toLocaleString()}
                </span>
                {' '}(final amount may be confirmed when we call you)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={`/track-order?orderReference=${encodeURIComponent(confirmedOrder.orderReference)}&email=${encodeURIComponent(address.email)}`}
                className="border border-foreground text-foreground px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-surface transition-all text-center"
              >
                Track order
              </Link>
              <Link to="/" className="bg-foreground text-primary-foreground px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 transition-all text-center">
                Continue shopping
              </Link>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function OrderSummarySidebar({
  items,
  location,
  getSubtotal,
  getShipping,
  getTotal,
}: {
  items: ReturnType<typeof useCartStore.getState>['items'];
  location: CheckoutLocation | null;
  getSubtotal: () => number;
  getShipping: () => number;
  getTotal: () => number;
}) {
  return (
    <div className="bg-surface rounded-sm p-6 h-fit lg:sticky lg:top-24">
      <h3 className="font-display text-lg text-foreground mb-4">Order Summary</h3>
      {items.map((item) => (
        <div key={item.variantId} className="flex gap-3 mb-3 pb-3 border-b border-border last:border-0">
          <img src={item.image} alt="" className="w-14 h-16 object-cover rounded-sm" />
          <div className="flex-1">
            <p className="font-body text-xs font-medium text-foreground">{item.name}</p>
            <p className="font-body text-[11px] text-muted-foreground">{item.size} / {item.color} × {item.quantity}</p>
            <p className="font-body text-xs font-semibold">रू {(item.price * item.quantity).toLocaleString()}</p>
          </div>
        </div>
      ))}
      <div className="space-y-2 mt-4 pt-4 border-t border-border">
        {location && (
          <div className="flex justify-between font-body text-xs gap-4">
            <span className="text-muted-foreground shrink-0">Location</span>
            <span className="text-right font-mono text-[10px]">{formatCoords(location.lat, location.lng)}</span>
          </div>
        )}
        <div className="flex justify-between font-body text-xs"><span className="text-muted-foreground">Subtotal</span><span>रू {getSubtotal().toLocaleString()}</span></div>
        <div className="flex justify-between font-body text-xs"><span className="text-muted-foreground">Delivery</span><span>{formatShippingAmount(getShipping())}</span></div>
        <div className="flex justify-between font-body text-sm font-semibold pt-2 border-t border-border"><span>Total</span><span>रू {getTotal().toLocaleString()}</span></div>
      </div>
    </div>
  );
}
