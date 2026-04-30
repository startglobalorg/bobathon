'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, Layers, MapPin, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Item = { id: string; href: string; label: string; icon: LucideIcon };

const items: Item[] = [
  { id: 'profile', href: '/profile', label: 'Profile', icon: User },
  { id: 'swipe', href: '/', label: 'Swipe', icon: Layers },
  { id: 'map', href: '/map', label: 'Map', icon: MapPin },
  { id: 'status', href: '/status', label: 'Status', icon: ClipboardList },
];

export function BottomNav() {
  const pathname = usePathname() || '/';
  if (pathname.startsWith('/listing/')) return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="max-w-md mx-auto px-5 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 pointer-events-auto">
        <nav className="bg-white border border-border rounded-full h-16 flex items-center justify-around shadow-soft">
          {items.map((it) => {
            const active = isActive(it.href);
            const Icon = it.icon;
            return (
              <Link
                key={it.id}
                href={it.href}
                aria-label={it.label}
                className="flex flex-col items-center justify-center gap-0.5 min-h-11 min-w-16"
              >
                <Icon
                  size={24}
                  strokeWidth={active ? 2 : 1.5}
                  className={active ? 'text-accent' : 'text-ink-400'}
                />
                <span
                  className={`text-[11px] font-medium ${
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
