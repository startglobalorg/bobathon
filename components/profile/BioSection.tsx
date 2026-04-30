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
    <section className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,20,25,0.06)] p-5">
      <h2 className="text-xl font-semibold text-[#0F1419] tracking-tight mb-1">About you</h2>
      <p className="text-sm text-[#8A95A1] mb-4">Shown to landlords when you apply.</p>
      <div>
        <label className="block text-sm font-medium text-[#4A5560] mb-1.5">Short bio</label>
        <textarea
          className="w-full min-h-[120px] rounded-xl border border-[#E6E8EB] bg-white px-4 py-3 text-base text-[#0F1419] placeholder:text-[#8A95A1] focus:outline-none focus:border-[#0077C8] focus:ring-2 focus:ring-[#0077C8]/20 transition-colors resize-none"
          value={shortBio}
          onChange={(e) => {
            const v = e.target.value.slice(0, 500)
            setShortBio(v)
            save(v)
          }}
          placeholder="Tell landlords about yourself — your work, your lifestyle, why you're moving. The honest stuff lands best."
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-[#8A95A1]">{shortBio.length}/500</span>
        </div>
      </div>
    </section>
  )
}
