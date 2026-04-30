# Task: Generate Mock Apartment Listings for a Zurich Rental Web App

## Goal

Create `listings.json` containing 50 realistic mock rental apartment listings for Zürich, Switzerland.
The data will power a hackathon web app — it must look convincing in a UI with maps, filters, and image galleries.

## Output file

`listings.json` — array of 50 listing objects. Place it in the current working directory.

## Schema (match this exactly)

```json
{
  "id": "4002086534",
  "categories": ["APARTMENT", "FLAT"],
  "offerType": "RENT",
  "address": {
    "locality": "Zürich",
    "postalCode": "8001",
    "street": "Bahnhofstrasse 42",
    "geoCoordinates": { "latitude": 47.3744, "longitude": 8.5408 }
  },
  "characteristics": {
    "numberOfRooms": 3.5,
    "livingSpace": 82,
    "yearBuilt": 1965,
    "floor": 2,
    "hasBalcony": true,
    "hasParking": false,
    "hasElevator": true
  },
  "prices": {
    "rent": { "gross": 2400, "net": 2100, "interval": "MONTH" },
    "currency": "CHF"
  },
  "localization": {
    "primary": "de",
    "de": {
      "text": {
        "title": "Helle 3.5-Zimmer-Wohnung in Seefeld",
        "description": "Schöne, renovierte Wohnung mit Balkon und Blick auf den Zürichsee..."
      },
      "attachments": [
        { "type": "IMAGE", "url": "https://..." },
        { "type": "IMAGE", "url": "https://..." },
        { "type": "IMAGE", "url": "https://..." }
      ]
    }
  }
}
```

## Images — the critical part

Each listing needs **3–5 real apartment/interior photographs** in `attachments`.
Use your web search and fetch tools to find **actual, working image URLs** — not placeholders.

Good sources to search:
- **Unsplash** (`images.unsplash.com`) — search for apartment interior photos and extract direct photo CDN URLs in the format `https://images.unsplash.com/photo-{id}?w=1200&q=80`
- **Pexels** (`images.pexels.com`) — similar CDN URLs
- **Wikimedia Commons** — sometimes has real estate interior photos

Aim for a pool of ~25 distinct image URLs covering: living rooms, kitchens, bedrooms, bathrooms, balconies, building exteriors. Reuse them across listings (each listing should pick a different combination of 4–5 images from the pool).

**Verify at least 3–5 URLs actually resolve** before embedding them.

## Realistic Zürich data

### Neighbourhoods & postal codes
Spread listings across real Zürich districts:
- Altstadt / Rathaus → 8001 (lat ~47.374, lng ~8.541)
- Langstrasse / Aussersihl → 8004 (lat ~47.377, lng ~8.530)
- Wiedikon → 8003 (lat ~47.370, lng ~8.523)
- Industriequartier / Gewerbeschule → 8005 (lat ~47.388, lng ~8.522)
- Seefeld / Mühlebach → 8008 (lat ~47.356, lng ~8.558)
- Wollishofen → 8038 (lat ~47.341, lng ~8.527)
- Unterstrass / Oberstrass → 8006 (lat ~47.384, lng ~8.543)
- Fluntern / Zürichberg → 8044 (lat ~47.380, lng ~8.562)
- Oerlikon → 8050 (lat ~47.410, lng ~8.544)
- Schwamendingen → 8051 (lat ~47.406, lng ~8.569)
- Albisrieden / Altstetten → 8047 (lat ~47.372, lng ~8.497)
- Höngg / Wipkingen → 8049 (lat ~47.397, lng ~8.499)

### Rental price ranges (CHF/month gross, Zürich 2024)
- 1.5 rooms, ~35 m²: CHF 1 100–1 700
- 2 rooms, ~50 m²: CHF 1 500–2 200
- 2.5 rooms, ~60 m²: CHF 1 800–2 600
- 3 rooms, ~75 m²: CHF 2 200–3 100
- 3.5 rooms, ~90 m²: CHF 2 600–3 700
- 4 rooms, ~105 m²: CHF 3 000–4 500
- 4.5 rooms, ~120 m²: CHF 3 500–5 200
- 5 rooms, ~140 m²: CHF 4 200–7 000

Net rent ≈ gross × 0.87–0.91.

### Street names to use
Bahnhofstrasse, Langstrasse, Seefeldstrasse, Wiedikonikerstrasse, Universitätstrasse,
Limmatquai, Bellerivestrasse, Hönggerstrasse, Birmensdorferstrasse, Rämistrasse,
Sihlquai, Hardturmstrasse, Stauffacherstrasse, Friesenbergstrasse, Gloriastrasse,
Weinbergstrasse, Zollikerstrasse, Schaffhauserstrasse, Badenerstrasse, Forchstrasse,
Militärstrasse, Neptunstrasse, Klosbachstrasse, Albisstrasse, Zürichbergstrasse.

### Titles & descriptions
Write in **German**. Titles like "Helle 3.5-Zimmer-Wohnung in Seefeld" or
"Renoviertes Apartment mit Balkon – direkt beim ÖV". Descriptions 2–4 sentences,
mentioning rooms, floor, neighbourhood character, nearby transport.

## Distribution requirements

Across the 50 listings, ensure variety:
- Mix of room sizes: at least 5 listings per room-count tier (1.5–5 rooms)
- Mix of neighbourhoods: at least 3 listings per district
- ~60% with balcony, ~40% with parking, ~50% with elevator
- Year built: spread from 1920 to 2022
- Floors: 0 (Erdgeschoss) through 6

## Verification

After writing `listings.json`, run this check and paste the output:
```bash
python3 -c "
import json
d = json.load(open('listings.json'))
print(f'Total listings: {len(d)}')
print(f'Keys: {list(d[0].keys())}')
imgs = d[0]['localization']['de']['attachments']
print(f'Images on first listing: {len(imgs)}')
print(f'First image URL: {imgs[0][\"url\"]}')
"
```

Expected: 50 listings, 3–5 images each, all image URLs start with `https://`.
