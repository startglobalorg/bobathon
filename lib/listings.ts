import type { Listing as PrismaListing } from '@prisma/client';
import type { Listing } from './types';

export function toUiListing(l: PrismaListing): Listing {
  let extraPhotos: string[] = [];
  try {
    const parsed: unknown = JSON.parse(l.gallery);
    if (Array.isArray(parsed)) {
      extraPhotos = parsed.filter((x): x is string => typeof x === 'string');
    }
  } catch {
    // malformed gallery — fall back to hero only
  }
  const photos = [l.heroImage, ...extraPhotos.filter((p) => p !== l.heroImage)];

  const features: string[] = [];
  if (l.balcony) features.push('Balcony');
  if (l.parking) features.push('Parking');
  if (l.hasDishwasher) features.push('Dishwasher');
  if (l.hasElevator) features.push('Elevator');
  if (l.hasLaundry) features.push('Laundry in building');
  if (l.furnished) features.push('Furnished');
  if (l.petsAllowed) features.push('Pets ok');

  const available = l.availabilityStart.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const duration =
    l.availabilityDurationMonths != null
      ? `${l.availabilityDurationMonths} months`
      : '12+ months';

  return {
    id: l.id,
    title: l.title,
    neighborhood: l.neighborhood,
    street: l.addressLine,
    rooms: l.rooms,
    sqm: l.sizeSqm,
    price: l.priceChf,
    floor: `Floor ${l.floor}`,
    year: l.yearBuilt,
    distance: `${l.distanceFromCenterKm.toFixed(1)} km from HB`,
    available,
    duration,
    photos,
    features,
    note: l.customNotes,
    coords: `${l.lat},${l.lng}`,
  };
}
