'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { CompletenessResult } from '@/lib/completeness'

export function CompletenessHeader({ result }: { result: CompletenessResult }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E6E8EB] pt-[env(safe-area-inset-top)]">
      <div className="max-w-[480px] mx-auto px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Logo_Apartner.svg" alt="Apartner" className="h-6" />
          {result.isReadyToApply ? (
            <span className="text-xs font-medium text-[#1F9D55] bg-[#e6f7ef] px-2.5 py-1 rounded-full">
              Ready to apply
            </span>
          ) : (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium text-[#4A5560] min-h-[44px] px-1"
            >
              {result.missing.length} item{result.missing.length !== 1 ? 's' : ''} missing
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
        <div className="h-1.5 bg-[#F7F8FA] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0077C8] rounded-full transition-all duration-300"
            style={{ width: `${result.percent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[#8A95A1]">Profile completeness</span>
          <span className="text-xs font-medium text-[#4A5560]">{result.percent}%</span>
        </div>
        {expanded && result.missing.length > 0 && (
          <ul className="mt-2 space-y-1 pb-1">
            {result.missing.map((item) => (
              <li key={item} className="text-xs text-[#4A5560] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D64545] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  )
}
