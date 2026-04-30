'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, Layers, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Item = { id: string; href: string; label: string; icon: LucideIcon };

const items: Item[] = [
  { id: 'profile', href: '/profile', label: 'Profile', icon: User },
  { id: 'swipe', href: '/', label: 'Swipe', icon: Layers },
  { id: 'status', href: '/status', label: 'Status', icon: ClipboardList },
];

export function BottomNav() {
  const pathname = usePathname() || '/';
  if (pathname.startsWith('/listing/')) return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const activeIndex = items.findIndex((it) => isActive(it.href));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="max-w-md mx-auto px-5 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 pointer-events-auto">
        <nav
          aria-label="Primary"
          className="relative bg-white border border-border rounded-full h-16 flex items-center shadow-soft px-1.5 isolate"
        >
          {/* Sliding active pill */}
          {activeIndex >= 0 && (
            <span
              aria-hidden
              className="absolute top-1.5 bottom-1.5 rounded-full bg-accent-soft transition-transform duration-300 ease-out-strong"
              style={{
                width: `calc((100% - 0.75rem) / ${items.length})`,
                left: '0.375rem',
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            />
          )}

          {items.map((it) => {
            const active = isActive(it.href);
            const Icon = it.icon;
            return (
              <Link
                key={it.id}
                href={it.href}
                aria-label={it.label}
                aria-current={active ? 'page' : undefined}
                className="relative z-10 flex-1 flex flex-col items-center justify-center gap-0.5 min-h-11 min-w-16 active:scale-95 transition-transform duration-150 ease-out"
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2 : 1.5}
                  className={`transition-colors ${
                    active ? 'text-accent' : 'text-ink-400'
                  }`}
                />
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    active ? 'text-accent' : 'text-ink-600'
                  }`}
                >
                  {it.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
