import asyncio
import json
import re
from playwright.async_api import async_playwright

SEARCH_URL = "https://www.homegate.ch/rent/real-estate/city-zurich/matching-list"
MAX_SEARCH_PAGES = 3
OUTPUT_FILE = "listings.json"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/131.0.0.0 Safari/537.36"
)


def extract_json_balanced(html: str, marker: str) -> str | None:
    # Fallback when regex fails. Note: counts braces without tracking string
    # boundaries, so may fail if JSON string values contain literal { or }.
    # This is acceptable since Homegate's machine-generated JSON avoids this.
    idx = html.find(marker)
    if idx == -1:
        return None
    start = html.find("{", idx)
    if start == -1:
        return None
    depth = 0
    for i, ch in enumerate(html[start:], start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return html[start : i + 1]
    return None


def extract_initial_state(html: str) -> dict | None:
    m = re.search(
        r"window\.__INITIAL_STATE__\s*=\s*(\{.+?\})\s*;?\s*</script>",
        html,
        re.DOTALL,
    )
    if m:
        try:
            return json.loads(m.group(1))
        except json.JSONDecodeError:
            pass
    raw = extract_json_balanced(html, "window.__INITIAL_STATE__")
    if raw:
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            pass
    return None


def extract_pinia_state(html: str) -> dict | None:
    m = re.search(
        r"window\.__PINIA_INITIAL_STATE__\s*=\s*(\{.+?\})\s*;?\s*</script>",
        html,
        re.DOTALL,
    )
    if m:
        try:
            return json.loads(m.group(1))
        except json.JSONDecodeError:
            pass
    raw = extract_json_balanced(html, "window.__PINIA_INITIAL_STATE__")
    if raw:
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            pass
    return None


def extract_listing_ids(state: dict) -> list:
    """Extract listing IDs from initial state."""
    try:
        listings = state["resultList"]["search"]["fullSearch"]["result"]["listings"]
        return [item["listing"]["id"] for item in listings]
    except (KeyError, TypeError, IndexError):
        return []


def extract_listing_detail(pinia: dict) -> dict | None:
    """Extract listing detail from Pinia state."""
    try:
        return pinia["listing"]["listing"]
    except (KeyError, TypeError):
        return None


async def fetch_all_listings() -> list[dict]:
    all_ids: list[str] = []
    listings: list[dict] = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent=USER_AGENT, locale="de-CH")
        page = await context.new_page()

        # Phase 1: collect listing IDs from search pages
        for page_num in range(1, MAX_SEARCH_PAGES + 1):
            url = SEARCH_URL if page_num == 1 else f"{SEARCH_URL}?ep={page_num}"
            print(f"Collecting IDs from search page {page_num}...")
            try:
                await page.goto(url, wait_until="networkidle", timeout=30000)
                html = await page.content()
                state = extract_initial_state(html)
                if state is None:
                    print(f"  Warning: could not parse __INITIAL_STATE__ on page {page_num}")
                    continue
                ids = extract_listing_ids(state)
                print(f"  Found {len(ids)} listings on page {page_num}")
                all_ids.extend(ids)
            except Exception as e:
                print(f"  Error on search page {page_num}: {e}")

        total = len(all_ids)
        print(f"\nTotal listing IDs collected: {total}")

        # Phase 2: fetch full property details
        for i, listing_id in enumerate(all_ids, 1):
            url = f"https://www.homegate.ch/rent/{listing_id}"
            print(f"Fetching listing {i}/{total} (id={listing_id})")
            try:
                await page.goto(url, wait_until="networkidle", timeout=30000)
                html = await page.content()
                pinia = extract_pinia_state(html)
                if pinia is None:
                    print(f"  Warning: no __PINIA_INITIAL_STATE__ for {listing_id}")
                    continue
                detail = extract_listing_detail(pinia)
                if detail is None:
                    print(f"  Warning: could not extract detail for {listing_id}")
                    continue
                listings.append(detail)
            except Exception as e:
                print(f"  Error fetching listing {listing_id}: {e}")

            await asyncio.sleep(0.5)

    return listings


async def main() -> None:
    listings = await fetch_all_listings()
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(listings, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Saved {len(listings)} listings to {OUTPUT_FILE}")


if __name__ == "__main__":
    asyncio.run(main())
