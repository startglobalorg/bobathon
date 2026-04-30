'use client'
import { useState, useCallback, useRef } from 'react'
import type { ClientProfile, ProfilePatch } from '@/lib/api/profile-client'
import { updateProfile } from '@/lib/api/profile-client'
import type { SaveStatus } from './SaveIndicator'

type Props = {
  profile: ClientProfile
  onUpdate: (updated: Partial<ClientProfile>) => void
  onSaveStatus: (status: SaveStatus) => void
}

function toDateInput(iso: string): string {
  if (!iso) return ''
  return iso.split('T')[0]
}

export function PersonalInfoSection({ profile, onUpdate, onSaveStatus }: Props) {
  const [fields, setFields] = useState({
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    birthday: toDateInput(profile.birthday),
    nationality: profile.nationality ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? '',
  })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(
    async (patch: ProfilePatch) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        onSaveStatus('saving')
        try {
          const updated = await updateProfile(patch)
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

  const onChange = (field: keyof typeof fields, value: string) =>
    setFields((prev) => ({ ...prev, [field]: value }))

  const onBlur = (field: keyof typeof fields) => save({ [field]: fields[field] })

  const onDateChange = (value: string) => {
    setFields((prev) => ({ ...prev, birthday: value }))
    save({ birthday: value ? new Date(value).toISOString() : undefined })
  }

  return (
    <section className="bg-white rounded-2xl shadow-soft p-5">
      <h2 className="text-xl font-semibold text-ink-900 tracking-tight mb-4">Personal info</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <input
              className={inputCls}
              value={fields.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              onBlur={() => onBlur('firstName')}
              placeholder="Ada"
            />
          </Field>
          <Field label="Last name">
            <input
              className={inputCls}
              value={fields.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              onBlur={() => onBlur('lastName')}
              placeholder="Lovelace"
            />
          </Field>
        </div>
        <Field label="Birthday">
          <input
            type="date"
            className={inputCls}
            value={fields.birthday}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </Field>
        <Field label="Nationality">
          <input
            className={inputCls}
            value={fields.nationality}
            onChange={(e) => onChange('nationality', e.target.value)}
            onBlur={() => onBlur('nationality')}
            placeholder="Swiss"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            className={inputCls}
            value={fields.email}
            onChange={(e) => onChange('email', e.target.value)}
            onBlur={() => onBlur('email')}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            className={inputCls}
            value={fields.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            onBlur={() => onBlur('phone')}
            placeholder="+41 79 123 45 67"
          />
        </Field>
      </div>
    </section>
  )
}

const inputCls =
  'w-full h-12 rounded-xl border border-border bg-white px-4 text-base text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-[border-color,box-shadow] duration-150 ease-out'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
