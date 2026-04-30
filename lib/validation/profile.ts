import { z } from 'zod'

export const furnishedPreferenceEnum = z.enum(['any', 'furnished', 'unfurnished'])

export const profileUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  birthday: z.string().optional(),
  nationality: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  shortBio: z.string().max(500).optional(),
  cvPath: z.string().nullable().optional(),
  debtCollectionCertPath: z.string().nullable().optional(),
  proofOfSalaryPath: z.string().nullable().optional(),
})

export const preferencesUpsertSchema = z.object({
  priceMaxChf: z.number().int().min(0),
  roomsMin: z.number().min(0),
  sizeSqmMin: z.number().int().min(0),
  neighborhoods: z.string(),
  needsBalcony: z.boolean(),
  needsParking: z.boolean(),
  petFriendly: z.boolean(),
  furnishedPreference: furnishedPreferenceEnum,
})

export const landlordCreateSchema = z.object({
  name: z.string(),
  contact: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
})

export const landlordUpdateSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
})
