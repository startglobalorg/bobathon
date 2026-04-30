// Runtime types: dates are ISO strings after JSON serialization
export type ClientPreferences = {
  id: number
  profileId: number
  priceMaxChf: number
  roomsMin: number
  sizeSqmMin: number
  neighborhoods: string
  needsBalcony: boolean
  needsParking: boolean
  petFriendly: boolean
  furnishedPreference: string
}

export type ClientLandlord = {
  id: number
  profileId: number
  name: string
  contact: string
  periodStart: string
  periodEnd: string
}

export type ClientProfile = {
  id: number
  firstName: string
  lastName: string
  birthday: string
  nationality: string
  email: string
  phone: string
  shortBio: string
  cvPath: string | null
  debtCollectionCertPath: string | null
  proofOfSalaryPath: string | null
  previousLandlords: ClientLandlord[]
  preferences: ClientPreferences | null
  createdAt: string
  updatedAt: string
}

export type ProfilePatch = Partial<{
  firstName: string
  lastName: string
  birthday: string
  nationality: string
  email: string
  phone: string
  shortBio: string
  cvPath: string | null
  debtCollectionCertPath: string | null
  proofOfSalaryPath: string | null
}>

export async function getProfile(): Promise<ClientProfile> {
  const res = await fetch('/api/profile')
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

export async function updateProfile(data: ProfilePatch): Promise<ClientProfile> {
  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}

export type PreferencesInput = Omit<ClientPreferences, 'id' | 'profileId'>

export async function upsertPreferences(data: PreferencesInput): Promise<ClientPreferences> {
  const res = await fetch('/api/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to save preferences')
  return res.json()
}

export type LandlordInput = {
  name: string
  contact: string
  periodStart: string
  periodEnd: string
}

export async function createLandlord(data: LandlordInput): Promise<ClientLandlord> {
  const res = await fetch('/api/landlords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create landlord')
  return res.json()
}

export async function updateLandlord(id: number, data: Partial<LandlordInput>): Promise<ClientLandlord> {
  const res = await fetch(`/api/landlords/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update landlord')
  return res.json()
}

export async function deleteLandlord(id: number): Promise<void> {
  const res = await fetch(`/api/landlords/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete landlord')
}

export async function uploadFile(
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/upload')
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    })
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText).path)
        } catch {
          reject(new Error('Invalid upload response'))
        }
      } else {
        try {
          reject(new Error(JSON.parse(xhr.responseText)?.error ?? 'Upload failed'))
        } catch {
          reject(new Error('Upload failed'))
        }
      }
    })
    xhr.addEventListener('error', () => reject(new Error('Upload failed')))
    const fd = new FormData()
    fd.append('file', file)
    xhr.send(fd)
  })
}
