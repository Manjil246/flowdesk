import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { maxDeliveryChargeForProducts } from '@/lib/delivery-charge';

export interface CartItem {
  productId: string;
  colorId: string;
  variantId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  maxStock: number;
  freeDelivery: boolean;
  deliveryCharge: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getSubtotal: () => number;
  getShipping: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

/** One delivery fee per order — highest charge among unique products. */
function shippingForItems(items: CartItem[]): number {
  const byProduct = new Map<string, { freeDelivery: boolean; deliveryCharge: number }>();
  for (const item of items) {
    if (!byProduct.has(item.productId)) {
      byProduct.set(item.productId, {
        freeDelivery: item.freeDelivery ?? false,
        deliveryCharge: item.deliveryCharge ?? 0,
      });
    }
  }
  return maxDeliveryChargeForProducts(byProduct.values());
}

export function formatShippingAmount(amount: number): string {
  return amount === 0 ? 'Free' : `रू ${amount.toLocaleString()}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === item.variantId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? {
                      ...i,
                      quantity: Math.min(
                        i.quantity + item.quantity,
                        i.maxStock,
                      ),
                      freeDelivery: item.freeDelivery,
                      deliveryCharge: item.deliveryCharge,
                    }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
              : i,
          ),
        })),

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getShipping: () => shippingForItems(get().items),
      getTotal: () => get().getSubtotal() + get().getShipping(),
      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'stylesutra-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
