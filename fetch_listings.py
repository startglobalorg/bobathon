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
