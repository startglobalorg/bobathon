'use client'
import { useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { ClientPreferences, PreferencesInput } from '@/lib/api/profile-client'
import { upsertPreferences } from '@/lib/api/profile-client'
import { NeighborhoodPicker } from './NeighborhoodPicker'
import type { SaveStatus } from './SaveIndicator'

type FurnishedPref = 'any' | 'furnished' | 'unfurnished'

type Props = {
  preferences: ClientPreferences | null
  onUpdate: (preferences: ClientPreferences) => void
  onSaveStatus: (status: SaveStatus) => void
}

type Fields = {
  priceMaxChf: number
  roomsMin: number
  sizeSqmMin: number
  neighborhoods: string[]
  needsBalcony: boolean
  needsParking: boolean
  petFriendly: boolean
  furnishedPreference: FurnishedPref
}

const FURNISHED_OPTS: FurnishedPref[] = ['any', 'furnished', 'unfurnished']

export function PreferencesSection({ preferences, onUpdate, onSaveStatus }: Props) {
  const [fields, setFields] = useState<Fields>({
    priceMaxChf: preferences?.priceMaxChf ?? 3000,
    roomsMin: preferences?.roomsMin ?? 1,
    sizeSqmMin: preferences?.sizeSqmMin ?? 20,
    neighborhoods: preferences?.neighborhoods
      ? preferences.neighborhoods.split(',').filter(Boolean)
      : [],
    needsBalcony: preferences?.needsBalcony ?? false,
    needsParking: preferences?.needsParking ?? false,
    petFriendly: preferences?.petFriendly ?? false,
    furnishedPreference: (preferences?.furnishedPreference ?? 'any') as FurnishedPref,
  })
  const fieldsRef = useRef<Fields>(fields)
  fieldsRef.current = fields
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      onSaveStatus('saving')
      try {
        const current = fieldsRef.current
        const input: PreferencesInput = {
          priceMaxChf: current.priceMaxChf,
          roomsMin: current.roomsMin,
          sizeSqmMin: current.sizeSqmMin,
          neighborhoods: current.neighborhoods.join(','),
          needsBalcony: current.needsBalcony,
          needsParking: current.needsParking,
          petFriendly: current.petFriendly,
          furnishedPreference: current.furnishedPreference,
        }
        const updated = await upsertPreferences(input)
        onUpdate(updated)
        onSaveStatus('saved')
        setTimeout(() => onSaveStatus('idle'), 2000)
      } catch {
        onSaveStatus('error')
      }
    }, 300)
  }, [onUpdate, onSaveStatus])

  const update = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    const next = { ...fieldsRef.current, [key]: value }
    fieldsRef.current = next
    setFields(next)
    save()
  }

  const inputCls =
    'w-full h-12 rounded-xl border border-border bg-white px-4 text-base text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-[border-color,box-shadow] duration-150 ease-out'

  const furnishedIndex = FURNISHED_OPTS.indexOf(fields.furnishedPreference)

  return (
    <section className="bg-white rounded-2xl shadow-soft p-5">
      <h2 className="text-xl font-semibold text-ink-900 tracking-tight mb-4">Preferences</h2>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink-600 mb-1.5">
            Max rent (CHF/month)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-base select-none pointer-events-none font-medium">
              CHF
            </span>
            <input
              type="number"
              className={cn(inputCls, 'pl-14 tabular-nums')}
              value={fields.priceMaxChf}
              onChange={(e) => update('priceMaxChf', parseInt(e.target.value) || 0)}
              onBlur={() => save()}
              min={0}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-600 mb-1.5">Minimum rooms</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => update('roomsMin', Math.max(0.5, fields.roomsMin - 0.5))}
              aria-label="Decrease rooms"
              className="w-12 h-12 rounded-xl border border-border text-ink-600 text-xl font-medium flex items-center justify-center hover:bg-surface-soft transition-colors active:scale-95"
            >
              −
            </button>
            <span className="flex-1 text-center text-base font-semibold text-ink-900 tabular-nums">
              {fields.roomsMin} room{fields.roomsMin !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={() => update('roomsMin', fields.roomsMin + 0.5)}
              aria-label="Increase rooms"
              className="w-12 h-12 rounded-xl border border-border text-ink-600 text-xl font-medium flex items-center justify-center hover:bg-surface-soft transition-colors active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-600 mb-1.5">Minimum size</label>
          <div className="relative">
            <input
              type="number"
              className={cn(inputCls, 'pr-14 tabular-nums')}
              value={fields.sizeSqmMin}
              onChange={(e) => update('sizeSqmMin', parseInt(e.target.value) || 0)}
              onBlur={() => save()}
              min={0}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 text-base select-none pointer-events-none font-medium">
              m²
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-600 mb-2">Neighborhoods</label>
          <NeighborhoodPicker
            selected={fields.neighborhoods}
            onChange={(selected) => update('neighborhoods', selected)}
          />
        </div>

        <div className="space-y-1">
          <Toggle
            label="Balcony required"
            checked={fields.needsBalcony}
            onChange={(v) => update('needsBalcony', v)}
          />
          <Toggle
            label="Parking required"
            checked={fields.needsParking}
            onChange={(v) => update('needsParking', v)}
          />
          <Toggle
            label="Pet-friendly"
            checked={fields.petFriendly}
            onChange={(v) => update('petFriendly', v)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-600 mb-2">
            Furnished preference
          </label>
          <div
            role="radiogroup"
            aria-label="Furnished preference"
            className="relative grid grid-cols-3 rounded-xl bg-surface-soft p-1 isolate"
          >
            <span
              aria-hidden
              className="absolute inset-y-1 left-1 rounded-lg bg-white shadow-soft transition-transform duration-200 ease-out-strong"
              style={{
                width: 'calc((100% - 0.5rem) / 3)',
                transform: `translateX(${furnishedIndex * 100}%)`,
              }}
            />
            {FURNISHED_OPTS.map((opt) => {
              const active = fields.furnishedPreference === opt
              return (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => update('furnishedPreference', opt)}
                  className={cn(
                    'relative z-10 h-10 text-sm font-medium capitalize transition-colors',
                    active ? 'text-ink-900' : 'text-ink-600 hover:text-ink-900',
                  )}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between min-h-[48px] py-1 -mx-1 px-1 rounded-lg hover:bg-surface-soft/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <span className="text-[15px] text-ink-900">{label}</span>
      <span
        className={cn(
          'w-12 h-7 rounded-full relative transition-colors duration-200 ease-out',
          checked ? 'bg-accent' : 'bg-border',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-soft transition-transform duration-200 ease-out-strong',
            checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  )
}
