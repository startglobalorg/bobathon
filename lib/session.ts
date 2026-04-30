import { cookies, headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'apartner_uid';

/**
 * Returns the numeric Profile.id for the current browser session.
 * Reads the UUID from the cookie (set by middleware) or the x-apartner-uid
 * forwarded header (same-request fallback on first visit). Creates the
 * profile on first access and handles concurrent-creation races.
 */
export async function getProfileId(): Promise<number> {
  const uid =
    cookies().get(COOKIE_NAME)?.value ??
    headers().get('x-apartner-uid') ??
    null;

  if (!uid) throw new Error('No session uid — middleware may not be running');

  const existing = await prisma.profile.findUnique({ where: { cookieId: uid } });
  if (existing) return existing.id;

  try {
    const profile = await prisma.profile.create({
      data: {
        cookieId: uid,
        firstName: '',
        lastName: '',
        birthday: new Date('1990-01-01'),
        nationality: '',
        email: '',
        phone: '',
        shortBio: '',
        preferences: {
          create: { priceMaxChf: 3000, roomsMin: 1, sizeSqmMin: 20, neighborhoods: '' },
        },
      },
    });
    return profile.id;
  } catch {
    // Race: another concurrent request created the profile first
    const profile = await prisma.profile.findUniqueOrThrow({ where: { cookieId: uid } });
    return profile.id;
  }
}
