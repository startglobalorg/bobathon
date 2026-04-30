import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { Toast } from './Toast';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white min-h-[100dvh] text-ink-900 antialiased">
      <div className="max-w-md mx-auto relative">{children}</div>
      <Toast />
      <BottomNav />
    </div>
  );
}
