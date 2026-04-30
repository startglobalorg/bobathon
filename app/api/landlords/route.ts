import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getProfileId } from '@/lib/session'
import { landlordCreateSchema } from '@/lib/validation/profile'

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = landlordCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { name, contact, periodStart, periodEnd } = parsed.data
  const profileId = await getProfileId()
  const landlord = await prisma.previousLandlord.create({
    data: {
      name,
      contact,
      periodStart,
      periodEnd,
      profileId,
    },
  })
  return NextResponse.json(landlord)
}
