import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { landlordUpdateSchema } from '@/lib/validation/profile'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params
  const id = parseInt(idStr)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const body = await request.json()
  const parsed = landlordUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { name, contact, periodStart, periodEnd } = parsed.data
  const landlord = await prisma.previousLandlord.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(contact !== undefined && { contact }),
      ...(periodStart !== undefined && { periodStart }),
      ...(periodEnd !== undefined && { periodEnd }),
    },
  })
  return NextResponse.json(landlord)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params
  const id = parseInt(idStr)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  await prisma.previousLandlord.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
