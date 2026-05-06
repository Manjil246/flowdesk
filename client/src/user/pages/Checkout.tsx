import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/user/stores/cartStore';
import Navbar from '@/user/components/Navbar';
import Footer from '@/user/components/Footer';
import AnnouncementBar from '@/user/components/AnnouncementBar';
import { toast } from 'sonner';
import { Check, CreditCard, Banknote, QrCode, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { coupons } from '@/user/data/products';

const provinces = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];

export default function Checkout() {
  const { items, getSubtotal, getShipping, getTotal, discount, couponCode, applyCoupon, removeCoupon, clearCart } = useCartStore();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({ firstName: '', lastName: '', phone: '', email: '', street: '', province: '', district: '', city: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [orderId] = useState(`SS-${Math.floor(1000 + Math.random() * 9000)}`);
  const [processing, setProcessing] = useState(false);

  const validateAddress = () => {
    if (!address.firstName || !address.lastName || !address.phone || !address.email || !address.street || !address.province || !address.city) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (!/^9\d{9}$/.test(address.phone)) {
      toast.error('Please enter a valid 10-digit phone number starting with 9');
      return false;
    }
    return true;
  };

  const handleApplyCoupon = () => {
    const coupon = coupons.find(c => c.code === couponInput.toUpperCase());
    if (!coupon) { toast.error('Invalid coupon code'); return; }
    if (coupon.minOrderValue > getSubtotal()) { toast.error(`Minimum order value: रू ${coupon.minOrderValue.toLocaleString()}`); return; }
    const disc = coupon.discountType === 'percentage' ? getSubtotal() * (coupon.discountValue / 100) : coupon.discountValue;
    applyCoupon(coupon.code, disc);
    toast.success(`Coupon applied! You save रू ${disc.toLocaleString()}`);
  };

  const handlePayment = () => {
    if (!paymentMethod) { toast.error('Please select a payment method'); return; }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep(2);
      clearCart();
    }, 2000);
  };

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
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {['Delivery', 'Payment', 'Confirmation'].map((label, i) => (
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
              <h2 className="font-display text-2xl text-foreground">Delivery Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="font-body text-xs font-medium text-foreground mb-1 block">First Name *</label><input value={address.firstName} onChange={e => setAddress({...address, firstName: e.target.value})} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-accent" /></div>
                <div><label className="font-body text-xs font-medium text-foreground mb-1 block">Last Name *</label><input value={address.lastName} onChange={e => setAddress({...address, lastName: e.target.value})} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-accent" /></div>
              </div>
              <div><label className="font-body text-xs font-medium text-foreground mb-1 block">Phone *</label><input value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} placeholder="98XXXXXXXX" className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-accent" /></div>
              <div><label className="font-body text-xs font-medium text-foreground mb-1 block">Email *</label><input type="email" value={address.email} onChange={e => setAddress({...address, email: e.target.value})} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-accent" /></div>
              <div><label className="font-body text-xs font-medium text-foreground mb-1 block">Street Address *</label><input value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-accent" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="font-body text-xs font-medium text-foreground mb-1 block">Province *</label>
                  <select value={address.province} onChange={e => setAddress({...address, province: e.target.value})} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-accent">
                    <option value="">Select Province</option>
                    {provinces.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div><label className="font-body text-xs font-medium text-foreground mb-1 block">City *</label><input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-accent" /></div>
              </div>
              <div><label className="font-body text-xs font-medium text-foreground mb-1 block">Delivery Notes</label><textarea value={address.notes} onChange={e => setAddress({...address, notes: e.target.value})} rows={3} placeholder="Any instructions for delivery?" className="w-full px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-accent resize-none" /></div>
              <button onClick={() => validateAddress() && setStep(1)} className="w-full bg-foreground text-primary-foreground py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 transition-all">
                Continue to Payment
              </button>
            </div>
            {/* Order summary sidebar */}
            <div className="bg-surface rounded-sm p-6 h-fit lg:sticky lg:top-24">
              <h3 className="font-display text-lg text-foreground mb-4">Order Summary</h3>
              {items.map(item => (
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
                <div className="flex justify-between font-body text-xs"><span className="text-muted-foreground">Subtotal</span><span>रू {getSubtotal().toLocaleString()}</span></div>
                {discount > 0 && <div className="flex justify-between font-body text-xs text-success"><span>Discount ({couponCode})</span><span>-रू {discount.toLocaleString()}</span></div>}
                <div className="flex justify-between font-body text-xs"><span className="text-muted-foreground">Shipping</span><span>रू {getShipping()}</span></div>
                <div className="flex justify-between font-body text-sm font-semibold pt-2 border-t border-border"><span>Total</span><span>रू {getTotal().toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-display text-2xl text-foreground">Payment Method</h2>
            {[
              { id: 'esewa', name: 'eSewa', desc: 'Pay securely with your eSewa digital wallet', color: 'bg-[#60BB46]', icon: CreditCard },
              { id: 'khalti', name: 'Khalti', desc: 'Pay with your Khalti wallet', color: 'bg-[#5C2D91]', icon: CreditCard },
              { id: 'fonepay', name: 'FonePay', desc: 'Scan QR with any FonePay-connected banking app', color: 'bg-[#E31E24]', icon: QrCode },
              { id: 'cod', name: 'Cash on Delivery', desc: 'रू 50 COD charge applies. Pay when you receive your order.', color: 'bg-foreground', icon: Banknote },
            ].map((pm) => (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                className={`w-full flex items-center gap-4 p-4 border rounded-sm transition-all text-left ${paymentMethod === pm.id ? 'border-foreground bg-surface' : 'border-border hover:border-foreground/30'}`}
              >
                <div className={`w-10 h-10 ${pm.color} rounded-sm flex items-center justify-center`}>
                  <pm.icon size={18} className="text-primary-foreground" />
                </div>
                <div>
                  <p className="font-body text-sm font-medium text-foreground">{pm.name}</p>
                  <p className="font-body text-xs text-muted-foreground">{pm.desc}</p>
                </div>
              </button>
            ))}

            {!couponCode && (
              <div className="flex gap-2">
                <input value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder="Coupon code" className="flex-1 px-4 py-3 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-accent" />
                <button onClick={handleApplyCoupon} className="px-6 py-3 border border-foreground font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-surface transition-colors">Apply</button>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(0)} className="flex-1 border border-foreground text-foreground py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-surface transition-colors">
                Back
              </button>
              <button onClick={handlePayment} disabled={processing} className="flex-1 bg-foreground text-primary-foreground py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 transition-all disabled:opacity-50">
                {processing ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : `Pay with ${paymentMethod ? paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1) : '...'}`}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center py-12">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-success" />
            </div>
            <h2 className="font-display text-3xl text-foreground mb-2">Order Confirmed!</h2>
            <p className="font-body text-lg text-accent font-semibold mb-4">{orderId}</p>
            <p className="font-body text-sm text-muted-foreground mb-8">
              Thank you, {address.firstName || 'there'}! Your order has been placed successfully.
              You'll receive a confirmation email shortly.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to={`/track-order`} className="border border-foreground text-foreground px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-surface transition-all">
                Track Order
              </Link>
              <Link to="/" className="bg-foreground text-primary-foreground px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 transition-all">
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}


