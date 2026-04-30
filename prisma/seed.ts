import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

type ListingSeed = {
  id: string;
  title: string;
  heroImage: string;
  gallery: string;
  sizeSqm: number;
  priceChf: number;
  rooms: number;
  balcony: boolean;
  parking: boolean;
  addressLine: string;
  neighborhood: string;
  lat: number;
  lng: number;
  floor: number;
  availabilityStart: string;
  availabilityDurationMonths: number | null;
  furnished: boolean;
  petsAllowed: boolean;
  customNotes: string;
  yearBuilt: number;
  distanceFromCenterKm: number;
  hasDishwasher: boolean;
  hasLaundry: boolean;
  hasElevator: boolean;
};

async function main() {
  await prisma.application.deleteMany();
  await prisma.listing.deleteMany();

  const raw = fs.readFileSync(
    path.resolve(process.cwd(), "data/listings.json"),
    "utf-8"
  );
  const listings: ListingSeed[] = JSON.parse(raw);

  for (const l of listings) {
    await prisma.listing.create({
      data: {
        ...l,
        availabilityStart: new Date(l.availabilityStart),
      },
    });
  }

  const existing = await prisma.profile.findUnique({ where: { id: 1 } });
  if (!existing) {
    await prisma.profile.create({
      data: {
        id: 1,
        firstName: "",
        lastName: "",
        birthday: new Date("1990-01-01"),
        nationality: "",
        email: "",
        phone: "",
        shortBio: "",
        preferences: {
          create: {
            priceMaxChf: 3000,
            roomsMin: 1,
            sizeSqmMin: 20,
            neighborhoods: "",
          },
        },
      },
    });
  }

  console.log(`Seeded ${listings.length} listings, profile id=1 ready.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
