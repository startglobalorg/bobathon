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
            type="button"
            aria-pressed={active}
            onClick={() => toggle(kreis)}
            className={cn(
              'h-9 px-3 rounded-full text-sm font-medium transition-colors active:scale-[0.97]',
              active
                ? 'bg-accent text-white shadow-soft'
                : 'bg-surface-soft text-ink-600 hover:bg-accent-soft hover:text-accent-hover',
            )}
          >
            {kreis}
          </button>
        )
      })}
    </div>
  )
}
