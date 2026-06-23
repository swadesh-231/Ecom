import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === product._id,
          );
          if (existing) {
            const nextQty = Math.min(existing.qty + qty, product.stock);
            return {
              items: state.items.map((i) =>
                i.productId === product._id ? { ...i, qty: nextQty } : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.images[0]?.url,
                stock: product.stock,
                qty: Math.min(qty, product.stock) || 1,
              },
            ],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      setQty: (productId, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) }
              : i,
          ),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: "ecom-cart" },
  ),
);

// Derived selectors (use as useCart(selectTotalItems) to avoid re-renders).
export const selectTotalItems = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.qty, 0);

export const selectTotalPrice = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.qty * i.price, 0);
