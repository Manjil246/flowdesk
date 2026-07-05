import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore, formatShippingAmount } from '@/user/stores/cartStore';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getShipping, getTotal, getItemCount } = useCartStore();
  const drawerTop = 'calc(var(--announcement-height, 0px) + 4rem)';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-30"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ top: drawerTop, height: `calc(100dvh - ${drawerTop})` }}
            className="fixed right-0 w-full max-w-[420px] bg-background z-30 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-display text-lg sm:text-xl">Your Cart ({getItemCount()} items)</h2>
              <button onClick={closeCart} aria-label="Close cart"><X size={20} /></button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
                <p className="font-body text-sm text-muted-foreground">Your cart is empty</p>
                <button onClick={closeCart} className="bg-foreground text-primary-foreground px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm">
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-3 pb-4 border-b border-border last:border-0">
                      <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-sm" />
                      <div className="flex-1">
                        <h4 className="font-body text-sm font-medium text-foreground leading-tight">{item.name}</h4>
                        <p className="font-body text-[11px] text-muted-foreground mt-0.5">{item.size} / {item.color}</p>
                        <p className="font-body text-sm font-semibold text-foreground mt-1">रू {item.price.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="w-6 h-6 border border-border flex items-center justify-center rounded-sm">
                            <Minus size={12} />
                          </button>
                          <span className="font-body text-sm w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="w-6 h-6 border border-border flex items-center justify-center rounded-sm">
                            <Plus size={12} />
                          </button>
                          <button onClick={() => removeItem(item.variantId)} className="ml-auto text-muted-foreground hover:text-cta">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="p-4 border-t border-border space-y-2">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">रू {getSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">{formatShippingAmount(getShipping())}</span>
                  </div>
                  <div className="flex justify-between font-body text-base font-semibold pt-2 border-t border-border">
                    <span>Total</span>
                    <span>रू {getTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button onClick={closeCart} className="flex-1 border border-foreground text-foreground py-3 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-surface transition-colors">
                      Continue Shopping
                    </button>
                    <Link
                      to="/checkout"
                      onClick={closeCart}
                      className="flex-1 bg-foreground text-primary-foreground py-3 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm text-center hover:bg-foreground/85 transition-colors"
                    >
                      Checkout
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


