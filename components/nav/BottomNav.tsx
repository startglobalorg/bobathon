'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Heart, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/profile', label: 'Profile', Icon: User },
  { href: '/swipe', label: 'Swipe', Icon: Heart },
  { href: '/status', label: 'Status', Icon: ClipboardList },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E6E8EB] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-[480px] mx-auto flex">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 min-h-[52px] transition-colors',
                active ? 'text-[#0077C8]' : 'text-[#8A95A1]',
              )}
            >
              <Icon size={24} strokeWidth={active ? 2 : 1.5} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
