// Plain-JS production seed — runs after migrations, skips if listings already exist.
'use strict';
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.listing.count();
  if (count > 0) {
    console.log(`Seed: ${count} listings already present, skipping.`);
    return;
  }

  const raw = fs.readFileSync(path.resolve(process.cwd(), 'data/listings.json'), 'utf-8');
  const listings = JSON.parse(raw);

  for (const l of listings) {
    await prisma.listing.create({
      data: { ...l, availabilityStart: new Date(l.availabilityStart) },
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
