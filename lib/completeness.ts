export type ProfileForCompleteness = {
  firstName: string
  lastName: string
  birthday: string | Date | null
  nationality: string
  email: string
  phone: string
  shortBio: string
  cvPath: string | null
  debtCollectionCertPath: string | null
  proofOfSalaryPath: string | null
  preferences: {
    priceMaxChf: number
    roomsMin: number
    neighborhoods: string
  } | null
  previousLandlords: unknown[]
}

export type CompletenessResult = {
  percent: number
  missing: string[]
  isReadyToApply: boolean
}

export function computeCompleteness(profile: ProfileForCompleteness): CompletenessResult {
  const required: [boolean, string][] = [
    [!!profile.firstName, 'First name'],
    [!!profile.lastName, 'Last name'],
    [!!profile.birthday, 'Birthday'],
    [!!profile.nationality, 'Nationality'],
    [!!profile.email, 'Email'],
    [!!profile.phone, 'Phone'],
    [(profile.shortBio?.length ?? 0) >= 50, 'Short bio (at least 50 characters)'],
    [!!profile.cvPath, 'CV'],
    [!!profile.debtCollectionCertPath, 'Betreibungsauszug'],
    [!!profile.proofOfSalaryPath, 'Salärnachweis'],
    [(profile.preferences?.priceMaxChf ?? 0) > 0, 'Maximum rent'],
    [(profile.preferences?.roomsMin ?? 0) > 0, 'Minimum rooms'],
    [!!(profile.preferences?.neighborhoods), 'Neighborhoods'],
  ]

  const bonus: [boolean, string][] = [
    [(profile.previousLandlords?.length ?? 0) > 0, 'Previous landlords'],
  ]

  const missing = required.filter(([ok]) => !ok).map(([, label]) => label)
  const passedRequired = required.filter(([ok]) => ok).length
  const percent = Math.round((passedRequired / required.length) * 100)
  const isReadyToApply = required.every(([ok]) => ok)
  void bonus

  return { percent, missing, isReadyToApply }
}
