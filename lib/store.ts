'use client';

import { create } from 'zustand';
import {
  COVER_LETTER_DE,
  DEFAULT_PROFILE,
  LISTINGS,
  initialApplications,
} from './data';
import type { Application, Listing, Profile } from './types';

type ToastState = { id: number; message: string } | null;

type AppState = {
  profile: Profile;
  applications: Application[];
  deck: Listing[];
  toast: ToastState;
  setProfile: (updater: (prev: Profile) => Profile) => void;
  showToast: (message: string, ms?: number) => void;
  hideToast: () => void;
  resetDeck: () => void;
  likeListing: (listing: Listing) => void;
  approveApplication: (id: string) => void;
  discardApplication: (id: string) => void;
};

let toastTimer: ReturnType<typeof setTimeout> | null = null;
let secondToastTimer: ReturnType<typeof setTimeout> | null = null;
const progressionTimers: Record<string, ReturnType<typeof setTimeout>[]> = {};

export const useAppStore = create<AppState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  applications: initialApplications(),
  deck: LISTINGS,
  toast: null,

  setProfile: (updater) => set((s) => ({ profile: updater(s.profile) })),

  showToast: (message, ms = 2000) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: { id: Date.now(), message } });
    toastTimer = setTimeout(() => set({ toast: null }), ms);
  },

  hideToast: () => set({ toast: null }),

  resetDeck: () => set({ deck: [...LISTINGS] }),

  likeListing: (listing) => {
    const { showToast } = get();
    showToast('Liked. Drafting your application…', 1800);
    if (secondToastTimer) clearTimeout(secondToastTimer);
    secondToastTimer = setTimeout(() => {
      get().showToast('Application drafted — review in Status', 2400);
    }, 1900);
    set((s) => ({
      applications: [
        {
          id: 'a' + Date.now(),
          listingId: listing.id,
          status: 'pending_review',
          updatedAt: Date.now(),
          coverLetter: COVER_LETTER_DE,
        },
        ...s.applications,
      ],
    }));
  },

  approveApplication: (id) => {
    set((s) => ({
      applications: s.applications.map((a) =>
        a.id === id ? { ...a, status: 'applied', updatedAt: Date.now() } : a,
      ),
    }));
    get().showToast('Sent. The owner will be in touch.', 2200);

    const stages: Array<{ status: Application['status']; delay: number; visitDate?: string }> = [
      { status: 'visit_requested', delay: 8000 },
      { status: 'visit_booked', delay: 16000, visitDate: 'Wed 13 May, 18:30' },
      { status: 'accepted', delay: 24000 },
    ];

    progressionTimers[id]?.forEach(clearTimeout);
    progressionTimers[id] = stages.map((s) =>
      setTimeout(() => {
        set((state) => ({
          applications: state.applications.map((a) => {
            if (a.id !== id) return a;
            const next: Application = { ...a, status: s.status, updatedAt: Date.now() };
            if (s.visitDate) next.visitDate = s.visitDate;
            return next;
          }),
        }));
      }, s.delay),
    );
  },

  discardApplication: (id) => {
    progressionTimers[id]?.forEach(clearTimeout);
    delete progressionTimers[id];
    set((s) => ({ applications: s.applications.filter((a) => a.id !== id) }));
  },
}));
