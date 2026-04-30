import type { Listing } from '@/lib/types';

export async function getListings(): Promise<Listing[]> {
  const res = await fetch('/api/listings');
  if (!res.ok) throw new Error('Failed to load listings');
  return res.json() as Promise<Listing[]>;
}

export async function getListing(id: string): Promise<Listing> {
  const res = await fetch(`/api/listings/${id}`);
  if (!res.ok) throw new Error('Listing not found');
  return res.json() as Promise<Listing>;
}
