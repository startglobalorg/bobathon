import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toUiListing } from '@/lib/listings';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(toUiListing(listing));
}
