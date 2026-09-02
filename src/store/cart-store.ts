import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brandName: string;
  image: string | null;
  price: number;
  originalPrice: number;
  quantity: number;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        const cappedQuantity = Math.min(item.maxStock, quantity);

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: Math.min(i.maxStock, i.quantity + quantity) }
                : i
            ),
          });
          return;
        }

        if (cappedQuantity <= 0) return;
        set({ items: [...get().items, { ...item, quantity: cappedQuantity }] });
      },

      removeItem: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),

      incrementItem: (productId) =>
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.min(i.maxStock, i.quantity + 1) } : i
          ),
        }),

      decrementItem: (productId) =>
        set({
          items: get().items
            .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
        }),

      setQuantity: (productId, quantity) =>
        set({
          items: get()
            .items.map((i) =>
              i.productId === productId ? { ...i, quantity: Math.max(0, Math.min(i.maxStock, quantity)) } : i
            )
            .filter((i) => i.quantity > 0),
        }),

      clearCart: () => set({ items: [] }),
    }),
    { name: "aurelle-cart" }
  )
);

export function selectItemCount(state: CartState) {
  return state.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function selectSubtotal(state: CartState) {
  return state.items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
}

export function selectDiscount(state: CartState) {
  return state.items.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0);
}

export function selectTotal(state: CartState) {
  return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
