import { create } from "zustand";

type UIState = {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

// Shared UI state so the cart drawer can be opened from the navbar, product
// pages, or anywhere else.
export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
}));
