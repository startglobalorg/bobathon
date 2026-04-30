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
    """Fallback: find JSON object by balanced-brace counting after marker."""
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
