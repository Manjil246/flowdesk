import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string | null;
  discount: number;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getSubtotal: () => number;
  getShipping: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const SHIPPING_FLAT = 150;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      discount: 0,

      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.variantId === item.variantId);
        if (existing) {
          return {
            items: state.items.map(i =>
              i.variantId === item.variantId
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.maxStock) }
                : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),

      removeItem: (variantId) => set((state) => ({
        items: state.items.filter(i => i.variantId !== variantId),
      })),

      updateQuantity: (variantId, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.variantId === variantId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) } : i
        ),
      })),

      applyCoupon: (code, discount) => set({ couponCode: code, discount }),
      removeCoupon: () => set({ couponCode: null, discount: 0 }),
      clearCart: () => set({ items: [], couponCode: null, discount: 0 }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getShipping: () => (get().items.length > 0 ? SHIPPING_FLAT : 0),
      getTotal: () => Math.max(0, get().getSubtotal() - get().discount) + get().getShipping(),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'stylesutra-cart', partialize: (state) => ({ items: state.items, couponCode: state.couponCode, discount: state.discount }) }
  )
);


