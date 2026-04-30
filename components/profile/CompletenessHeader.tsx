'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { CompletenessResult } from '@/lib/completeness'
import { Wordmark } from '../Wordmark'

export function CompletenessHeader({ result }: { result: CompletenessResult }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border pt-[env(safe-area-inset-top)]">
      <div className="max-w-md mx-auto px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <Wordmark small />
          {result.isReadyToApply ? (
            <span className="text-xs font-medium text-success-ink bg-success-soft px-2.5 py-1 rounded-full">
              Ready to apply
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="flex items-center gap-1 text-xs font-medium text-ink-600 min-h-[44px] px-1 active:scale-95 transition-transform"
            >
              {result.missing.length} item{result.missing.length !== 1 ? 's' : ''} missing
              <ChevronDown
                size={14}
                strokeWidth={1.5}
                className={`transition-transform duration-200 ease-out ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>
        <div className="h-1.5 bg-surface-soft rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-[width] duration-300 ease-out-strong"
            style={{ width: `${result.percent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-ink-400">Profile completeness</span>
          <span className="text-xs font-medium text-ink-600 tabular-nums">
            {result.percent}%
          </span>
        </div>
        <div
          className={`grid transition-[grid-template-rows] duration-200 ease-out ${
            expanded && result.missing.length > 0 ? 'grid-rows-[1fr] mt-2' : 'grid-rows-[0fr]'
          }`}
        >
          <ul className="overflow-hidden space-y-1 pb-1">
            {result.missing.map((item) => (
              <li key={item} className="text-xs text-ink-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-warm flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}
