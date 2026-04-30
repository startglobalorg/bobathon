import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { toUiListing } from '@/lib/listings';
import { ListingDetail } from '@/components/ListingDetail';

export const dynamic = 'force-dynamic';

export default async function ListingPage({
  params,
}: {
  params: { id: string };
}) {
  const dbListing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!dbListing) notFound();
  return <ListingDetail listing={toUiListing(dbListing)} />;
}
