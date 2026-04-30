// Merges manually collected listings into data/listings.json
// Usage: npx tsx scripts/import-manual-listings.ts
//
// Put your collected listings (one JSON object per line, or a JSON array)
// into scripts/manual-listings.json before running.

import fs from "node:fs";
import path from "node:path";

const manualPath  = path.resolve(process.cwd(), "scripts/manual-listings.json");
const existingPath = path.resolve(process.cwd(), "data/listings.json");

if (!fs.existsSync(manualPath)) {
  console.error(`Not found: scripts/manual-listings.json\n\nCreate it with the listings you collected via the browser console snippet.`);
  process.exit(1);
}

const raw = fs.readFileSync(manualPath, "utf-8").trim();
const incoming: unknown[] = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [JSON.parse(raw)];

const existing: Record<string, unknown>[] = JSON.parse(fs.readFileSync(existingPath, "utf-8"));
const existingIds = new Set(existing.map(l => l.id));

let added = 0;
for (const l of incoming as Record<string, unknown>[]) {
  if (existingIds.has(l.id)) {
    console.log(`  skip (already exists): ${l.id}`);
    continue;
  }
  existing.push(l);
  existingIds.add(l.id as string);
  console.log(`  + ${l.id} — ${l.addressLine}`);
  added++;
}

fs.writeFileSync(existingPath, JSON.stringify(existing, null, 2));
console.log(`\nDone. Added ${added} listing(s). Total: ${existing.length}`);
console.log("Run  npm run db:seed  to reload the database.");
