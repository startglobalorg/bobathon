import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ZURICH_KREISE: Record<string, string> = {
  "8001": "Kreis 1", "8002": "Kreis 2", "8003": "Kreis 3", "8004": "Kreis 4",
  "8005": "Kreis 5", "8006": "Kreis 6", "8008": "Kreis 8", "8032": "Kreis 7",
  "8044": "Kreis 7", "8045": "Kreis 2", "8047": "Kreis 9", "8048": "Kreis 9",
  "8049": "Kreis 10", "8050": "Kreis 11", "8051": "Kreis 12", "8052": "Kreis 12",
  "8053": "Kreis 7", "8055": "Kreis 3",
};

function distanceFromCenter(lat: number, lng: number): number {
  const dLat = (lat - 47.3769) * (Math.PI / 180);
  const dLng = (lng - 8.5417) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(47.3769 * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled", "--no-sandbox"],
  });

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    locale: "de-CH",
    extraHTTPHeaders: { "Accept-Language": "de-CH,de;q=0.9" },
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    // @ts-ignore
    window.chrome = { runtime: {} };
  });

  const listings: unknown[] = [];
  const seen = new Set<string>();
  const page = await context.newPage();

  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("api.homegate.ch") && url.includes("listings") && response.status() === 200) {
      try {
        const data = await response.json();
        const results: unknown[] = data?.results ?? [];
        for (const r of results as Record<string, unknown>[]) {
          if (seen.has(r.id as string) || listings.length >= 20) continue;
          seen.add(r.id as string);

          const chars = (r.characteristics ?? {}) as Record<string, unknown>;
          const addr = (r.address ?? {}) as Record<string, unknown>;
          const geo = (addr.geoCoordinates ?? {}) as Record<string, number>;
          const prices = ((r.prices ?? {}) as Record<string, unknown>);
          const rent = (prices.rent ?? {}) as Record<string, number>;
          const media: Record<string, unknown>[] = (r.media ?? []) as Record<string, unknown>[];
          const images = media.filter(m => m.type === "IMAGE").map(m => m.url as string).filter(Boolean);
          const zip = (addr.postalCode ?? "") as string;
          const city = (addr.locality ?? "Zürich") as string;
          const lat = geo.latitude ?? 47.376;
          const lng = geo.longitude ?? 8.541;

          const mapped = {
            id: `hg-${r.id}`,
            heroImage: images[0] ?? "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            gallery: JSON.stringify(images.length > 0 ? images.slice(0, 5) : ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]),
            sizeSqm: (chars.livingSpace as number) ?? 60,
            priceChf: rent.gross ?? rent.net ?? 2000,
            rooms: (chars.numberOfRooms as number) ?? 2.5,
            balcony: !!(chars.hasBalcony),
            parking: !!((chars.parkingSpacesCountIndoor as number) > 0 || (chars.parkingSpacesCountOutdoor as number) > 0),
            addressLine: `${addr.street ?? ""} ${addr.streetNumber ?? ""}, ${zip} ${city}`.trim().replace(/^,\s*/, ""),
            neighborhood: ZURICH_KREISE[zip] ?? city,
            lat,
            lng,
            floor: (chars.floor as number) ?? 0,
            availabilityStart: new Date().toISOString(),
            availabilityDurationMonths: null,
            furnished: !!(chars.isFurnished),
            petsAllowed: !!(chars.petsAllowed),
            customNotes: ((r.description as Record<string, string>)?.text ?? "").slice(0, 300),
            yearBuilt: (chars.yearBuilt as number) ?? 1975,
            distanceFromCenterKm: distanceFromCenter(lat, lng),
            hasDishwasher: false,
            hasLaundry: !!(chars.hasWashingMachine),
            hasElevator: !!(chars.hasLift),
          };

          listings.push(mapped);
          console.log(`  ✓ ${mapped.addressLine} — ${mapped.priceChf} CHF, ${mapped.rooms} Zi.`);
        }
      } catch { /* ignore */ }
    }
  });

  console.log("Loading Homegate Zürich...");
  await page.goto(
    "https://www.homegate.ch/mieten/immobilien/ort-zuerich/trefferliste?ep=1&o=dateCreated-desc",
    { waitUntil: "domcontentloaded", timeout: 25000 }
  ).catch(() => {});

  await page.waitForTimeout(6000);

  // Scroll to trigger more API calls
  for (let i = 0; i < 2 && listings.length < 20; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);
  }

  await browser.close();

  if (listings.length === 0) {
    console.error("\nNo listings captured. Page title was likely a bot-check.");
    process.exit(1);
  }

  const outPath = path.resolve(process.cwd(), "data/listings.json");
  fs.writeFileSync(outPath, JSON.stringify(listings, null, 2));
  console.log(`\nSaved ${listings.length} real listings → data/listings.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
