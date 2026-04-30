# Build a Homegate.ch Listings Fetcher

## Goal

Create a Python script `fetch_listings.py` that scrapes ~60 rental apartment listings from Homegate.ch (Zurich) and saves them to `listings.json`. This data will feed a hackathon web app, so the script only needs to run once locally to produce a static dataset.

## Background (important — Homegate's structure changed in 2025)

Homegate.ch stores all listing data as JSON inside `<script>` tags on every page. There are TWO different patterns:

1. **Search pages** (`/rent/real-estate/city-zurich/matching-list`) — use the OLD pattern: `window.__INITIAL_STATE__ = {...};`
2. **Property detail pages** (`/rent/<id>`) — migrated to Vue 3/Pinia in 2025, use the NEW pattern: `window.__PINIA_INITIAL_STATE__ = {...};`

Both require **JavaScript rendering** — plain `requests.get()` returns 403 or empty HTML. We'll use Playwright with headless Chromium.

## Requirements

### Tech stack
- Python 3.10+
- `playwright` (with chromium)
- Standard library: `asyncio`, `json`, `re`

### Setup commands the user will run
```bash
pip install playwright
playwright install chromium
python fetch_listings.py
```

### Behavior

The script should:

1. Launch headless Chromium with a realistic User-Agent (`Chrome/131+`) and `de-CH` locale.

2. **Phase 1 — Collect listing IDs:**
   - Visit search pages 1 through 3 of `https://www.homegate.ch/rent/real-estate/city-zurich/matching-list` (pagination uses `?ep=2`, `?ep=3`).
   - On each page, extract the `window.__INITIAL_STATE__` JSON via regex.
   - Walk to `data["resultList"]["search"]["fullSearch"]["result"]["listings"]` — this is a list of listing cards.
   - For each card, grab `card["listing"]["id"]`.
   - Aggregate into a flat list of IDs (~60 total expected).

3. **Phase 2 — Fetch full property details:**
   - For each ID, visit `https://www.homegate.ch/rent/<id>`.
   - Extract `window.__PINIA_INITIAL_STATE__` JSON via regex.
   - Walk to `data["listing"]["listing"]` — this is the full listing object.
   - Skip listings that fail to parse (expired/redirected) without crashing the whole batch.
   - Add a small `await asyncio.sleep(0.5)` between property fetches to be polite.

4. **Phase 3 — Save:**
   - Write the full list to `listings.json` with `indent=2` and `ensure_ascii=False`.
   - Print progress as it goes (`Fetching listing 12/60 (id=...)`).
   - Print final summary: `✅ Saved N listings to listings.json`.

### Regex patterns to use

```python
# Search pages
re.search(
    r"window\.__INITIAL_STATE__\s*=\s*(\{.+?\})\s*;?\s*</script>",
    html,
    re.DOTALL,
)

# Property pages
re.search(
    r"window\.__PINIA_INITIAL_STATE__\s*=\s*(\{.+?\})\s*;?\s*</script>",
    html,
    re.DOTALL,
)
```

If a regex fails on some pages because the JSON contains nested `</script>` substrings, fall back to a balanced-brace parser (find the `{` after the `=` and walk through tracking depth).

### Error handling

- If a search page fails to parse, log it and skip — don't crash.
- If a property page fails to parse (KeyError, TypeError, JSONDecodeError), log it and skip.
- Wrap the main loop so that one bad listing doesn't kill the run.

### Constants at the top of the file

```python
SEARCH_URL = "https://www.homegate.ch/rent/real-estate/city-zurich/matching-list"
MAX_SEARCH_PAGES = 3
OUTPUT_FILE = "listings.json"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
```

## Expected output shape

Each entry in `listings.json` should look roughly like:

```json
{
  "id": "4002086534",
  "categories": ["APARTMENT", "FLAT"],
  "offerType": "RENT",
  "address": {
    "locality": "Zürich",
    "postalCode": "8001",
    "street": "...",
    "geoCoordinates": {"latitude": 47.37, "longitude": 8.54}
  },
  "characteristics": {
    "numberOfRooms": 3.5,
    "livingSpace": 82,
    "yearBuilt": 1965,
    "hasBalcony": true
  },
  "prices": {
    "rent": {"gross": 2400, "interval": "MONTH"},
    "currency": "CHF"
  },
  "localization": {
    "primary": "de",
    "de": {
      "text": {"title": "...", "description": "..."},
      "attachments": [
        {"type": "IMAGE", "url": "https://media2.homegate.ch/.../image.jpg"}
      ]
    }
  }
}
```

The `attachments` array (image URLs) is critical for the downstream UI — please verify it's present in at least the first listing after the run.

## Verification step

After writing the script, run it and then run this check:

```bash
python -c "
import json
d = json.load(open('listings.json'))
print(f'Total listings: {len(d)}')
print(f'Sample keys: {list(d[0].keys())}')
imgs = d[0].get('localization', {}).get('de', {}).get('attachments', []) or d[0].get('localization', {}).get('en', {}).get('attachments', [])
print(f'Images on first listing: {len(imgs)}')
print(f'First image URL: {imgs[0][\"url\"] if imgs else \"NONE\"}')
"
```

Expected output:
- Total listings: 40-60
- Sample keys includes `address`, `prices`, `characteristics`, `localization`
- Images on first listing: 5+
- First image URL: starts with `https://media2.homegate.ch/`

If images come back as 0, the path to attachments may be different — inspect `listings.json` and adjust the verification (and document where the images actually live in a comment in the script).

## Deliverables

1. `fetch_listings.py` — the script described above.
2. Run it and produce `listings.json`.
3. Run the verification command and confirm output looks healthy.
4. If anything failed or shape differs from expected, note it briefly so I know what to tell the team.

## Out of scope

- No web app, no UI, no Claude API calls — that's a separate phase.
- No proxy/anti-bot service — local Playwright should be enough for a one-off run of 60 listings.
- No retries beyond skipping bad pages — keep it simple.