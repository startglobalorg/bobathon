// Plain-JS production seed — runs after migrations. Upserts listings from data/listings.json and removes stale ones.
'use strict';
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const raw = fs.readFileSync(path.resolve(process.cwd(), 'data/listings.json'), 'utf-8');
  const listings = JSON.parse(raw);
  const newIds = listings.map((l) => l.id);

  // Remove applications for listings that are no longer in the seed file
  await prisma.application.deleteMany({ where: { listingId: { notIn: newIds } } });
  // Remove listings that are no longer in the seed file
  await prisma.listing.deleteMany({ where: { id: { notIn: newIds } } });

  for (const l of listings) {
    await prisma.listing.upsert({
      where: { id: l.id },
      update: { ...l, availabilityStart: new Date(l.availabilityStart) },
      create: { ...l, availabilityStart: new Date(l.availabilityStart) },
    });
  }

  const existing = await prisma.profile.findUnique({ where: { id: 1 } });
  if (!existing) {
    await prisma.profile.create({
      data: {
        id: 1,
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
  }

  console.log(`Seed: ${listings.length} listings inserted, profile id=1 ready.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
