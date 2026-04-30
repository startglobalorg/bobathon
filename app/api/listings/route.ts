import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toUiListing } from '@/lib/listings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const listings = await prisma.listing.findMany({
    orderBy: { availabilityStart: 'asc' },
  });
  return NextResponse.json(listings.map(toUiListing));
}
