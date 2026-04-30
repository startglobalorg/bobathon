'use client'
import { cn } from '@/lib/utils'

const KREISE = Array.from({ length: 12 }, (_, i) => `Kreis ${i + 1}`)

type Props = {
  selected: string[]
  onChange: (selected: string[]) => void
}

export function NeighborhoodPicker({ selected, onChange }: Props) {
  const toggle = (kreis: string) => {
    onChange(
      selected.includes(kreis) ? selected.filter((k) => k !== kreis) : [...selected, kreis],
    )
  }
  return (
    <div className="flex flex-wrap gap-2">
      {KREISE.map((kreis) => {
        const active = selected.includes(kreis)
        return (
          <button
            key={kreis}
            onClick={() => toggle(kreis)}
            className={cn(
              'h-9 px-3 rounded-full text-sm font-medium transition-colors',
              active
                ? 'bg-[#0077C8] text-white'
                : 'bg-[#F7F8FA] text-[#4A5560] hover:bg-[#E5F1FA] hover:text-[#0077C8]',
            )}
          >
            {kreis}
          </button>
        )
      })}
    </div>
  )
}
