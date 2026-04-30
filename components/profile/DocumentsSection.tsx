'use client'
import { useCallback } from 'react'
import type { ClientProfile } from '@/lib/api/profile-client'
import { updateProfile } from '@/lib/api/profile-client'
import { DocumentUploader } from './DocumentUploader'
import type { SaveStatus } from './SaveIndicator'

type DocField = 'cvPath' | 'debtCollectionCertPath' | 'proofOfSalaryPath'

type Props = {
  profile: ClientProfile
  onUpdate: (updated: Partial<ClientProfile>) => void
  onSaveStatus: (status: SaveStatus) => void
}

export function DocumentsSection({ profile, onUpdate, onSaveStatus }: Props) {
  const saveField = useCallback(
    async (field: DocField, value: string | null) => {
      onSaveStatus('saving')
      try {
        const updated = await updateProfile({ [field]: value })
        onUpdate(updated)
        onSaveStatus('saved')
        setTimeout(() => onSaveStatus('idle'), 2000)
      } catch {
        onSaveStatus('error')
      }
    },
    [onUpdate, onSaveStatus],
  )

  const docs: { field: DocField; label: string }[] = [
    { field: 'cvPath', label: 'CV / Lebenslauf' },
    { field: 'debtCollectionCertPath', label: 'Betreibungsauszug' },
    { field: 'proofOfSalaryPath', label: 'Salärnachweis' },
  ]

  return (
    <section className="bg-white rounded-2xl shadow-soft p-5">
      <h2 className="text-xl font-semibold text-ink-900 tracking-tight mb-1">Documents</h2>
      <p className="text-sm text-ink-400 mb-4">Required for most applications in Zürich.</p>
      <div className="space-y-3">
        {docs.map(({ field, label }) => (
          <DocumentUploader
            key={field}
            label={label}
            currentPath={profile[field]}
            onUploaded={(path) => saveField(field, path)}
            onRemoved={() => saveField(field, null)}
          />
        ))}
      </div>
    </section>
  )
}
