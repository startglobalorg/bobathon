'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { ClientLandlord } from '@/lib/api/profile-client'
import { createLandlord, deleteLandlord } from '@/lib/api/profile-client'
import { LandlordRow } from './LandlordRow'
import type { SaveStatus } from './SaveIndicator'

type Props = {
  landlords: ClientLandlord[]
  onUpdate: (landlords: ClientLandlord[]) => void
  onSaveStatus: (status: SaveStatus) => void
}

export function LandlordsSection({ landlords, onUpdate, onSaveStatus }: Props) {
  const [list, setList] = useState<ClientLandlord[]>(landlords)

  const handleAdd = async () => {
    onSaveStatus('saving')
    try {
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
      const now = new Date().toISOString()
      const newLandlord = await createLandlord({
        name: '',
        contact: '',
        periodStart: oneYearAgo,
        periodEnd: now,
      })
      const updated = [...list, newLandlord]
      setList(updated)
      onUpdate(updated)
      onSaveStatus('saved')
      setTimeout(() => onSaveStatus('idle'), 2000)
    } catch {
      onSaveStatus('error')
    }
  }

  const handleRowUpdate = (id: number, updated: ClientLandlord) => {
    const newList = list.map((l) => (l.id === id ? updated : l))
    setList(newList)
    onUpdate(newList)
  }

  const handleRemove = async (id: number) => {
    onSaveStatus('saving')
    try {
      await deleteLandlord(id)
      const newList = list.filter((l) => l.id !== id)
      setList(newList)
      onUpdate(newList)
      onSaveStatus('saved')
      setTimeout(() => onSaveStatus('idle'), 2000)
    } catch {
      onSaveStatus('error')
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-soft p-5">
      <h2 className="text-xl font-semibold text-ink-900 tracking-tight mb-1">Previous landlords</h2>
      <p className="text-sm text-ink-400 mb-4">
        {list.length === 0
          ? 'Add your previous landlords — strong references make landlords trust you faster.'
          : 'Strong references make landlords trust you faster.'}
      </p>
      <div className="space-y-3">
        {list.map((landlord) => (
          <LandlordRow
            key={landlord.id}
            landlord={landlord}
            onUpdate={(updated) => handleRowUpdate(landlord.id, updated)}
            onRemove={() => handleRemove(landlord.id)}
            onSaveStatus={onSaveStatus}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="mt-4 w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-border text-accent font-medium text-base hover:bg-accent-soft hover:border-accent/30 transition-colors active:scale-[0.98]"
      >
        <Plus size={20} strokeWidth={1.5} />
        Add landlord
      </button>
    </section>
  )
}
