'use client'
import { useState, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import type { ClientLandlord } from '@/lib/api/profile-client'
import { updateLandlord } from '@/lib/api/profile-client'
import type { SaveStatus } from './SaveIndicator'

function toDateInput(iso: string): string {
  return iso ? iso.split('T')[0] : ''
}

type Props = {
  landlord: ClientLandlord
  onUpdate: (updated: ClientLandlord) => void
  onRemove: () => void
  onSaveStatus: (status: SaveStatus) => void
}

export function LandlordRow({ landlord, onUpdate, onRemove, onSaveStatus }: Props) {
  const [fields, setFields] = useState({
    name: landlord.name,
    contact: landlord.contact,
    periodStart: toDateInput(landlord.periodStart),
    periodEnd: toDateInput(landlord.periodEnd),
  })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = (patch: Partial<typeof fields>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      onSaveStatus('saving')
      try {
        const apiPatch: Parameters<typeof updateLandlord>[1] = {}
        if (patch.name !== undefined) apiPatch.name = patch.name
        if (patch.contact !== undefined) apiPatch.contact = patch.contact
        if (patch.periodStart !== undefined && patch.periodStart)
          apiPatch.periodStart = new Date(patch.periodStart).toISOString()
        if (patch.periodEnd !== undefined && patch.periodEnd)
          apiPatch.periodEnd = new Date(patch.periodEnd).toISOString()
        const updated = await updateLandlord(landlord.id, apiPatch)
        onUpdate(updated)
        onSaveStatus('saved')
        setTimeout(() => onSaveStatus('idle'), 2000)
      } catch {
        onSaveStatus('error')
      }
    }, 300)
  }

  const cls =
    'w-full h-12 rounded-xl border border-border bg-white px-4 text-base text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-[border-color,box-shadow] duration-150 ease-out'

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="text-ink-400 hover:text-error transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
          aria-label="Remove landlord"
        >
          <Trash2 size={18} strokeWidth={1.5} />
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-600 mb-1.5">Name</label>
        <input
          className={cls}
          value={fields.name}
          onChange={(e) => setFields((p) => ({ ...p, name: e.target.value }))}
          onBlur={() => save({ name: fields.name })}
          placeholder="Landlord name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-600 mb-1.5">Contact</label>
        <input
          className={cls}
          value={fields.contact}
          onChange={(e) => setFields((p) => ({ ...p, contact: e.target.value }))}
          onBlur={() => save({ contact: fields.contact })}
          placeholder="Email or phone"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-ink-600 mb-1.5">From</label>
          <input
            type="date"
            className={cls}
            value={fields.periodStart}
            onChange={(e) => {
              setFields((p) => ({ ...p, periodStart: e.target.value }))
              save({ periodStart: e.target.value })
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-600 mb-1.5">To</label>
          <input
            type="date"
            className={cls}
            value={fields.periodEnd}
            onChange={(e) => {
              setFields((p) => ({ ...p, periodEnd: e.target.value }))
              save({ periodEnd: e.target.value })
            }}
          />
        </div>
      </div>
    </div>
  )
}
