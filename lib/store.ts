import { create } from 'zustand';

type ToastState = { id: number; message: string } | null;

type AppState = {
  toast: ToastState;
  showToast: (message: string, ms?: number) => void;
  hideToast: () => void;
};

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useAppStore = create<AppState>((set) => ({
  toast: null,

  showToast: (message, ms = 2000) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: { id: Date.now(), message } });
    toastTimer = setTimeout(() => set({ toast: null }), ms);
  },

  hideToast: () => set({ toast: null }),
}));
