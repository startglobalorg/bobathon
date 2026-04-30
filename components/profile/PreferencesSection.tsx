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

export function PreferencesSection({ preferences, onUpdate, onSaveStatus }: Props) {
  const [fields, setFields] = useState<Fields>({
    priceMaxChf: preferences?.priceMaxChf ?? 3000,
    roomsMin: preferences?.roomsMin ?? 1,
    sizeSqmMin: preferences?.sizeSqmMin ?? 20,
    neighborhoods: preferences?.neighborhoods ? preferences.neighborhoods.split(',').filter(Boolean) : [],
    needsBalcony: preferences?.needsBalcony ?? false,
    needsParking: preferences?.needsParking ?? false,
    petFriendly: preferences?.petFriendly ?? false,
    furnishedPreference: (preferences?.furnishedPreference ?? 'any') as FurnishedPref,
  })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(
    (patch: Partial<Fields>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        onSaveStatus('saving')
        try {
          const merged = { ...fields, ...patch }
          const input: PreferencesInput = {
            priceMaxChf: merged.priceMaxChf,
            roomsMin: merged.roomsMin,
            sizeSqmMin: merged.sizeSqmMin,
            neighborhoods: merged.neighborhoods.join(','),
            needsBalcony: merged.needsBalcony,
            needsParking: merged.needsParking,
            petFriendly: merged.petFriendly,
            furnishedPreference: merged.furnishedPreference,
          }
          const updated = await upsertPreferences(input)
          onUpdate(updated)
          onSaveStatus('saved')
          setTimeout(() => onSaveStatus('idle'), 2000)
        } catch {
          onSaveStatus('error')
        }
      }, 300)
    },
    [fields, onUpdate, onSaveStatus],
  )

  const update = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }))
    save({ [key]: value })
  }

  const inputCls =
    'w-full h-12 rounded-xl border border-[#E6E8EB] bg-white px-4 text-base text-[#0F1419] placeholder:text-[#8A95A1] focus:outline-none focus:border-[#0077C8] focus:ring-2 focus:ring-[#0077C8]/20 transition-colors'

  return (
    <section className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,20,25,0.06)] p-5">
      <h2 className="text-xl font-semibold text-[#0F1419] tracking-tight mb-4">Preferences</h2>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#4A5560] mb-1.5">Max rent (CHF/month)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A95A1] text-base select-none pointer-events-none">
              CHF
            </span>
            <input
              type="number"
              className={cn(inputCls, 'pl-14')}
              value={fields.priceMaxChf}
              onChange={(e) => update('priceMaxChf', parseInt(e.target.value) || 0)}
              onBlur={() => save({ priceMaxChf: fields.priceMaxChf })}
              min={0}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A5560] mb-1.5">Minimum rooms</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => update('roomsMin', Math.max(0.5, fields.roomsMin - 0.5))}
              className="w-12 h-12 rounded-xl border border-[#E6E8EB] text-[#4A5560] text-xl font-medium flex items-center justify-center hover:bg-[#F7F8FA] transition-colors"
            >
              −
            </button>
            <span className="flex-1 text-center text-base font-medium text-[#0F1419]">
              {fields.roomsMin} room{fields.roomsMin !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => update('roomsMin', fields.roomsMin + 0.5)}
              className="w-12 h-12 rounded-xl border border-[#E6E8EB] text-[#4A5560] text-xl font-medium flex items-center justify-center hover:bg-[#F7F8FA] transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A5560] mb-1.5">Minimum size</label>
          <div className="relative">
            <input
              type="number"
              className={cn(inputCls, 'pr-14')}
              value={fields.sizeSqmMin}
              onChange={(e) => update('sizeSqmMin', parseInt(e.target.value) || 0)}
              onBlur={() => save({ sizeSqmMin: fields.sizeSqmMin })}
              min={0}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A95A1] text-base select-none pointer-events-none">
              m²
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A5560] mb-2">Neighborhoods</label>
          <NeighborhoodPicker
            selected={fields.neighborhoods}
            onChange={(selected) => update('neighborhoods', selected)}
          />
        </div>
        <div className="space-y-3">
          <Toggle label="Balcony required" checked={fields.needsBalcony} onChange={(v) => update('needsBalcony', v)} />
          <Toggle label="Parking required" checked={fields.needsParking} onChange={(v) => update('needsParking', v)} />
          <Toggle label="Pet-friendly" checked={fields.petFriendly} onChange={(v) => update('petFriendly', v)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A5560] mb-2">Furnished preference</label>
          <div className="flex rounded-xl border border-[#E6E8EB] overflow-hidden">
            {(['any', 'furnished', 'unfurnished'] as FurnishedPref[]).map((opt) => (
              <button
                key={opt}
                onClick={() => update('furnishedPreference', opt)}
                className={cn(
                  'flex-1 h-12 text-sm font-medium transition-colors capitalize',
                  fields.furnishedPreference === opt
                    ? 'bg-[#0077C8] text-white'
                    : 'text-[#4A5560] hover:bg-[#F7F8FA]',
                )}
              >
                {opt}
              </button>
            ))}
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
    <div className="flex items-center justify-between min-h-[44px]">
      <span className="text-sm text-[#0F1419]">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'w-12 h-7 rounded-full relative transition-colors focus-visible:ring-2 focus-visible:ring-[#0077C8] focus-visible:ring-offset-2',
          checked ? 'bg-[#0077C8]' : 'bg-[#E6E8EB]',
        )}
      >
        <span
          className={cn(
            'absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  )
}
