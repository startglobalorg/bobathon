'use client'
import { useState, useCallback, useRef } from 'react'
import type { ClientProfile } from '@/lib/api/profile-client'
import { updateProfile } from '@/lib/api/profile-client'
import type { SaveStatus } from './SaveIndicator'

type Props = {
  profile: ClientProfile
  onUpdate: (updated: Partial<ClientProfile>) => void
  onSaveStatus: (status: SaveStatus) => void
}

export function BioSection({ profile, onUpdate, onSaveStatus }: Props) {
  const [shortBio, setShortBio] = useState(profile.shortBio ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        onSaveStatus('saving')
        try {
          const updated = await updateProfile({ shortBio: value })
          onUpdate(updated)
          onSaveStatus('saved')
          setTimeout(() => onSaveStatus('idle'), 2000)
        } catch {
          onSaveStatus('error')
        }
      }, 300)
    },
    [onUpdate, onSaveStatus],
  )

  return (
    <section className="bg-white rounded-2xl shadow-soft p-5">
      <h2 className="text-xl font-semibold text-ink-900 tracking-tight mb-1">About you</h2>
      <p className="text-sm text-ink-400 mb-4">Shown to landlords when you apply.</p>
      <div>
        <label className="block text-sm font-medium text-ink-600 mb-1.5">Short bio</label>
        <textarea
          className="w-full min-h-[120px] rounded-xl border border-border bg-white px-4 py-3 text-base text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-[border-color,box-shadow] duration-150 ease-out resize-none"
          value={shortBio}
          onChange={(e) => {
            const v = e.target.value.slice(0, 500)
            setShortBio(v)
            save(v)
          }}
          placeholder="Tell landlords about yourself — your work, your lifestyle, why you're moving. The honest stuff lands best."
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-ink-400">{shortBio.length}/500</span>
        </div>
      </div>
    </section>
  )
}
