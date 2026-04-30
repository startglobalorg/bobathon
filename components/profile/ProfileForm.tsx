'use client'
import { useState, useCallback } from 'react'
import type { ClientProfile } from '@/lib/api/profile-client'
import { computeCompleteness } from '@/lib/completeness'
import { CompletenessHeader } from './CompletenessHeader'
import { SaveIndicator, type SaveStatus } from './SaveIndicator'
import { BottomNav } from '@/components/nav/BottomNav'
import { PersonalInfoSection } from './PersonalInfoSection'
import { BioSection } from './BioSection'
import { DocumentsSection } from './DocumentsSection'
import { LandlordsSection } from './LandlordsSection'

export function ProfileForm({ initialProfile }: { initialProfile: ClientProfile }) {
  const [profile, setProfile] = useState<ClientProfile>(initialProfile)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  const handleUpdate = useCallback((updated: Partial<ClientProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }))
  }, [])

  const completeness = computeCompleteness(profile)

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-24">
      <CompletenessHeader result={completeness} />
      <div className="max-w-[480px] mx-auto px-5 py-6 space-y-4">
        <div className="flex justify-end h-5">
          <SaveIndicator status={saveStatus} />
        </div>
        <PersonalInfoSection
          profile={profile}
          onUpdate={handleUpdate}
          onSaveStatus={setSaveStatus}
        />
        <BioSection
          profile={profile}
          onUpdate={handleUpdate}
          onSaveStatus={setSaveStatus}
        />
        <DocumentsSection
          profile={profile}
          onUpdate={handleUpdate}
          onSaveStatus={setSaveStatus}
        />
        <LandlordsSection
          landlords={profile.previousLandlords}
          onUpdate={(landlords) => handleUpdate({ previousLandlords: landlords })}
          onSaveStatus={setSaveStatus}
        />
      </div>
      <BottomNav />
    </div>
  )
}
