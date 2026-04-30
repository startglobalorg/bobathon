'use client';

import { Heart } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function Toast() {
  const toast = useAppStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div
      key={toast.id}
      className="fixed left-0 right-0 bottom-24 z-50 flex justify-center px-5 pointer-events-none"
    >
      <div className="max-w-md w-full pointer-events-auto">
        <div className="mx-auto bg-ink-900 text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sheet animate-toast">
          <span className="w-7 h-7 rounded-full bg-warm flex items-center justify-center flex-shrink-0">
            <Heart size={16} strokeWidth={2.5} className="text-white" />
          </span>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      </div>
    </div>
  );
}
