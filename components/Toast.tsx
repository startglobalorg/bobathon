'use client';

import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { useAppStore } from '@/lib/store';

type Phase = 'enter' | 'enter-active' | 'exit' | 'exit-active' | null;

export function Toast() {
  const toast = useAppStore((s) => s.toast);
  const [visible, setVisible] = useState<typeof toast>(null);
  const [phase, setPhase] = useState<Phase>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (toast) {
      if (exitTimer.current) {
        clearTimeout(exitTimer.current);
        exitTimer.current = null;
      }
      setVisible(toast);
      setPhase('enter');
      const r = requestAnimationFrame(() => setPhase('enter-active'));
      return () => cancelAnimationFrame(r);
    }
    if (visible) {
      setPhase('exit');
      const r = requestAnimationFrame(() => setPhase('exit-active'));
      exitTimer.current = setTimeout(() => {
        setVisible(null);
        setPhase(null);
      }, 200);
      return () => cancelAnimationFrame(r);
    }
  }, [toast, visible]);

  if (!visible) return null;

  const phaseClass =
    phase === 'enter'
      ? 'toast-enter'
      : phase === 'enter-active'
        ? 'toast-enter toast-enter-active'
        : phase === 'exit'
          ? 'toast-exit'
          : phase === 'exit-active'
            ? 'toast-exit toast-exit-active'
            : '';

  return (
    <div
      className="fixed left-0 right-0 bottom-24 z-50 flex justify-center px-5 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-md w-full pointer-events-auto">
        <div
          className={`mx-auto bg-ink-900 text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sheet ${phaseClass}`}
        >
          <span className="w-7 h-7 rounded-full bg-warm flex items-center justify-center flex-shrink-0">
            <Heart size={16} strokeWidth={2.5} className="text-white" />
          </span>
          <span className="text-sm font-medium">{visible.message}</span>
        </div>
      </div>
    </div>
  );
}
