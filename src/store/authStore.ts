import { create } from "zustand";

interface AuthState {
  isRegistered: boolean | null;
  isKeyVerified: boolean | null;
  setFlags: (f: { isRegistered: boolean; isKeyVerified: boolean }) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isRegistered: null,
  isKeyVerified: null,
  setFlags: (f) => set(f),
  reset: () => set({ isRegistered: null, isKeyVerified: null }),
}));
