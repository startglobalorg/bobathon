import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { preferencesUpsertSchema } from '@/lib/validation/profile'

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = preferencesUpsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const preferences = await prisma.preferences.upsert({
    where: { profileId: 1 },
    update: parsed.data,
    create: { ...parsed.data, profileId: 1 },
  })
  return NextResponse.json(preferences)
}
