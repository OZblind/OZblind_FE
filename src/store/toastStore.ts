import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";
export type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  durationMs: number;
};

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface ToastState {
  toasts: ToastItem[];
  push: (t: {
    message: string;
    type?: ToastType;
    durationMs?: number;
  }) => string;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: ({ message, type = "success", durationMs = 2500 }) => {
    const id = genId();
    set((s) => ({ toasts: [...s.toasts, { id, message, type, durationMs }] }));
    window.setTimeout(() => get().remove(id), durationMs);
    return id;
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
