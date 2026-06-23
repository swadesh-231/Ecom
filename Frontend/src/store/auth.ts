import { create } from "zustand";
import type { AppUser } from "@/lib/types";

type AuthState = {
  appUser: AppUser | null;
  isSyncing: boolean;
  setAppUser: (user: AppUser | null) => void;
  setSyncing: (v: boolean) => void;
  clear: () => void;
};

// Holds the app's view of the signed-in user (including the DB role), synced
// from the backend after Clerk authentication.
export const useAuthStore = create<AuthState>((set) => ({
  appUser: null,
  isSyncing: false,
  setAppUser: (appUser) => set({ appUser }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  clear: () => set({ appUser: null }),
}));

export const useIsAdmin = () =>
  useAuthStore((s) => s.appUser?.role === "admin");
