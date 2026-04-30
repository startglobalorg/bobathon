import { notFound } from 'next/navigation';
import { ListingDetail } from '@/components/ListingDetail';
import { LISTINGS } from '@/lib/data';

export function generateStaticParams() {
  return LISTINGS.map((l) => ({ id: l.id }));
}

export default function ListingPage({ params }: { params: { id: string } }) {
  const listing = LISTINGS.find((l) => l.id === params.id);
  if (!listing) notFound();
  return <ListingDetail listing={listing} />;
}
