import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getProfileId } from '@/lib/session'

export const dynamic = 'force-dynamic'
import { profileUpdateSchema } from '@/lib/validation/profile'
import { deleteUploadedFile } from '@/lib/upload'

export async function GET() {
  const profileId = await getProfileId()
  const profile = await prisma.profile.findUniqueOrThrow({
    where: { id: profileId },
    include: { previousLandlords: true, preferences: true },
  })
  return NextResponse.json(profile)
}

export async function PUT(request: Request) {
  const body = await request.json()
  const parsed = profileUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const profileId = await getProfileId()
  const current = await prisma.profile.findUniqueOrThrow({ where: { id: profileId } })
  const data = parsed.data

  const profile = await prisma.profile.update({
    where: { id: profileId },
    data: {
      ...data,
      birthday: data.birthday ?? undefined,
    },
    include: { previousLandlords: true, preferences: true },
  })

  // Delete old file from disk when path changes (non-fatal)
  const fileFields = ['cvPath', 'debtCollectionCertPath', 'proofOfSalaryPath'] as const
  for (const field of fileFields) {
    if (field in data && data[field] !== current[field] && current[field]) {
      await deleteUploadedFile(current[field]!)
    }
  }

  return NextResponse.json(profile)
}
