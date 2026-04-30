import json
import random
from collections import Counter
from pathlib import Path

OUTPUT = Path(__file__).parent / "listings.json"

random.seed(42)

PHOTO_POOL = [
    "https://images.unsplash.com/photo-1613575831056-0acd5da8f085",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    "https://images.unsplash.com/photo-1606074280798-2dabb75ce10c",
    "https://images.unsplash.com/photo-1612419299101-6c294dc2901d",
    "https://images.unsplash.com/photo-1629042306541-85e77116aed3",
    "https://images.unsplash.com/photo-1629042306547-c1d7c6c85ffa",
    "https://images.unsplash.com/photo-1600493505873-cddd69453072",
    "https://images.unsplash.com/photo-1663756915301-2ba688e078cf",
    "https://images.unsplash.com/photo-1610527003928-47afd5f470c6",
    "https://images.unsplash.com/photo-1630699144641-72fa7a6b8aa1",
    "https://images.unsplash.com/photo-1649068533606-0e7ef6786214",
    "https://plus.unsplash.com/premium_photo-1676321046449-3acb3cd47e81",
    "https://plus.unsplash.com/premium_photo-1676823553207-758c7a66e9bb",
    "https://images.unsplash.com/photo-1615874959474-d609969a20ed",
    "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20",
    "https://images.unsplash.com/photo-1562438668-bcf0ca6578f0",
    "https://images.unsplash.com/photo-1643949719317-4342d8d4031e",
    "https://images.unsplash.com/photo-1576698483491-8c43f0862543",
    "https://images.unsplash.com/photo-1600488999585-e4364713b90a",
    "https://images.unsplash.com/photo-1620626011761-996317b8d101",
    "https://plus.unsplash.com/premium_photo-1661963930456-4fb8ced9324e",
    "https://plus.unsplash.com/premium_photo-1675537843200-78c1a0ea1736",
    "https://plus.unsplash.com/premium_photo-1663126298656-33616be83c32",
    "https://plus.unsplash.com/premium_photo-1674676471963-4c4643beb12d",
]

DISTRICTS = [
    {"postalCode": "8001", "name": "Altstadt",          "lat": 47.374, "lng": 8.541},
    {"postalCode": "8004", "name": "Langstrasse",       "lat": 47.377, "lng": 8.530},
    {"postalCode": "8003", "name": "Wiedikon",          "lat": 47.370, "lng": 8.523},
    {"postalCode": "8005", "name": "Industriequartier", "lat": 47.388, "lng": 8.522},
    {"postalCode": "8008", "name": "Seefeld",           "lat": 47.356, "lng": 8.558},
    {"postalCode": "8038", "name": "Wollishofen",       "lat": 47.341, "lng": 8.527},
    {"postalCode": "8006", "name": "Unterstrass",       "lat": 47.384, "lng": 8.543},
    {"postalCode": "8044", "name": "Fluntern",          "lat": 47.380, "lng": 8.562},
    {"postalCode": "8050", "name": "Oerlikon",          "lat": 47.410, "lng": 8.544},
    {"postalCode": "8051", "name": "Schwamendingen",    "lat": 47.406, "lng": 8.569},
    {"postalCode": "8047", "name": "Albisrieden",       "lat": 47.372, "lng": 8.497},
    {"postalCode": "8049", "name": "Höngg",             "lat": 47.397, "lng": 8.499},
]

STREETS = [
    "Bahnhofstrasse", "Langstrasse", "Seefeldstrasse", "Wiedikonikerstrasse",
    "Universitätstrasse", "Limmatquai", "Bellerivestrasse", "Hönggerstrasse",
    "Birmensdorferstrasse", "Rämistrasse", "Sihlquai", "Hardturmstrasse",
    "Stauffacherstrasse", "Friesenbergstrasse", "Gloriastrasse",
    "Weinbergstrasse", "Zollikerstrasse", "Schaffhauserstrasse",
    "Badenerstrasse", "Forchstrasse", "Militärstrasse", "Neptunstrasse",
    "Klosbachstrasse", "Albisstrasse", "Zürichbergstrasse",
]

# (base_m2, price_min, price_max)
ROOM_TIERS = {
    1.5: (35,  1100, 1700),
    2.0: (50,  1500, 2200),
    2.5: (60,  1800, 2600),
    3.0: (75,  2200, 3100),
    3.5: (90,  2600, 3700),
    4.0: (105, 3000, 4500),
    4.5: (120, 3500, 5200),
    5.0: (140, 4200, 7000),
}

ADJECTIVES = [
    "Helle", "Moderne", "Renovierte", "Gemütliche", "Ruhige",
    "Charmante", "Grosszügige", "Stilvolle", "Sonnige", "Zentrale",
]

TITLE_TEMPLATES = [
    "{adj} {rooms}-Zimmer-Wohnung in {neighborhood}",
    "{rooms}-Zimmer-Apartment – {adj} Lage in {neighborhood}",
    "Schöne {rooms}-Zimmer-Wohnung nahe {neighborhood}",
    "{adj} Wohnung in {neighborhood} – {rooms} Zimmer",
    "Gepflegte {rooms}-Zi.-Wohnung, {neighborhood}er Lage",
]

DESC_TEMPLATES = [
    (
        "{adj}e {rooms}-Zimmer-Wohnung im {floor}. Obergeschoss in {neighborhood}. "
        "{balcony_txt}Beste Anbindung an den öffentlichen Verkehr. "
        "Die Liegenschaft wurde {year} erbaut und bietet {space} m² Wohnfläche."
    ),
    (
        "Willkommen in dieser {adj_low}en Wohnung mit {rooms} Zimmern und {space} m² im Herzen von {neighborhood}. "
        "Das Objekt befindet sich im {floor}. Stock{balcony_short} und wurde {year} erstellt. "
        "Tram und Bus sind in wenigen Gehminuten erreichbar."
    ),
    (
        "Diese {space} m² grosse {rooms}-Zimmer-Wohnung in {neighborhood} überzeugt durch ihren {adj_low}en Charakter. "
        "{balcony_txt}Baujahr {year}, {floor}. Etage. "
        "Hervorragende Erschliessung durch ÖV – S-Bahn und Busse direkt in der Nähe."
    ),
    (
        "Im {floor}. Stock dieses {year} erbauten Hauses in {neighborhood} liegt diese {adj_low}e {rooms}-Zimmer-Wohnung. "
        "{space} m² Wohnfläche{balcony_short}. "
        "Einkaufsmöglichkeiten, Schulen und ÖV-Anbindung befinden sich in unmittelbarer Nähe."
    ),
    (
        "{adj}e {rooms}-Zimmer-Wohnung mit {space} m² in {neighborhood}, Baujahr {year}. "
        "Gelegen im {floor}. Stock{balcony_short}. "
        "Die Umgebung bietet viel Lebensqualität: Restaurants, Parks und perfekte ÖV-Verbindungen."
    ),
]


def rooms_str(rooms: float) -> str:
    if rooms == int(rooms):
        return str(int(rooms))
    return str(rooms)


def pick_images(pool: list, idx: int, count: int) -> list:
    offset = (idx * 7) % len(pool)
    indices = [(offset + i) % len(pool) for i in range(count)]
    return [{"type": "IMAGE", "url": pool[j] + "?w=1200&q=80"} for j in indices]


def build_listing(idx: int, rooms: float, district: dict, has_balcony: bool,
                  has_parking: bool, has_elevator: bool) -> dict:
    base_m2, price_min, price_max = ROOM_TIERS[rooms]
    gross = random.randint(price_min, price_max)
    net = round(gross * random.uniform(0.87, 0.91))
    living_space = round(base_m2 * random.uniform(0.85, 1.15))
    year_built = random.randint(1920, 2022)
    floor = random.randint(0, 6)
    street = random.choice(STREETS)
    house_no = random.randint(1, 200)
    lat = round(district["lat"] + random.uniform(-0.003, 0.003), 6)
    lng = round(district["lng"] + random.uniform(-0.003, 0.003), 6)
    listing_id = str(random.randint(4_000_000_000, 4_999_999_999))

    adj = ADJECTIVES[idx % len(ADJECTIVES)]
    adj_low = adj.lower()
    neighborhood = district["name"]
    rooms_s = rooms_str(rooms)
    floor_s = str(floor) if floor > 0 else "Erd"

    balcony_txt = "Mit Balkon und direktem Lichteinfall. " if has_balcony else ""
    balcony_short = " mit Balkon" if has_balcony else ""

    title_tmpl = TITLE_TEMPLATES[idx % len(TITLE_TEMPLATES)]
    title = title_tmpl.format(adj=adj, rooms=rooms_s, neighborhood=neighborhood)

    desc_tmpl = DESC_TEMPLATES[idx % len(DESC_TEMPLATES)]
    description = desc_tmpl.format(
        adj=adj, adj_low=adj_low, rooms=rooms_s, space=living_space,
        neighborhood=neighborhood, floor=floor_s, year=year_built,
        balcony_txt=balcony_txt, balcony_short=balcony_short,
    )

    image_count = random.randint(3, 5)
    attachments = pick_images(PHOTO_POOL, idx, image_count)

    return {
        "id": listing_id,
        "categories": ["APARTMENT", "FLAT"],
        "offerType": "RENT",
        "address": {
            "locality": "Zürich",
            "postalCode": district["postalCode"],
            "street": f"{street} {house_no}",
            "geoCoordinates": {"latitude": lat, "longitude": lng},
        },
        "characteristics": {
            "numberOfRooms": rooms,
            "livingSpace": living_space,
            "yearBuilt": year_built,
            "floor": floor,
            "hasBalcony": has_balcony,
            "hasParking": has_parking,
            "hasElevator": has_elevator,
        },
        "prices": {
            "rent": {"gross": gross, "net": net, "interval": "MONTH"},
            "currency": "CHF",
        },
        "localization": {
            "primary": "de",
            "de": {
                "text": {"title": title, "description": description},
                "attachments": attachments,
            },
        },
    }


def main():
    # Pre-allocate distributions
    rooms_list = (
        [1.5] * 6 + [2.0] * 6 + [2.5] * 6 + [3.0] * 6 +
        [3.5] * 7 + [4.0] * 7 + [4.5] * 6 + [5.0] * 6
    )
    assert len(rooms_list) == 50

    # 2 districts get 5 listings, 10 districts get 4 = 50 total
    district_slots = [d for i, d in enumerate(DISTRICTS) for _ in range(5 if i < 2 else 4)]
    assert len(district_slots) == 50

    balcony_list  = [True] * 30 + [False] * 20   # 60%
    parking_list  = [True] * 20 + [False] * 30   # 40%
    elevator_list = [True] * 25 + [False] * 25   # 50%

    random.shuffle(rooms_list)
    random.shuffle(district_slots)
    random.shuffle(balcony_list)
    random.shuffle(parking_list)
    random.shuffle(elevator_list)

    used_ids: set[str] = set()
    listings = []

    for idx, (rooms, district, balcony, parking, elevator) in enumerate(
        zip(rooms_list, district_slots, balcony_list, parking_list, elevator_list)
    ):
        listing = build_listing(idx, rooms, district, balcony, parking, elevator)
        # Regenerate ID if collision (astronomically rare but guarded)
        while listing["id"] in used_ids:
            listing["id"] = str(random.randint(4_000_000_000, 4_999_999_999))
        used_ids.add(listing["id"])
        listings.append(listing)

    # Assert all distribution requirements
    assert len(listings) == 50

    room_counts = Counter(l["characteristics"]["numberOfRooms"] for l in listings)
    for r in [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]:
        assert room_counts[r] >= 5, f"Too few listings for {r} rooms: {room_counts[r]}"

    district_counts = Counter(l["address"]["postalCode"] for l in listings)
    for d in DISTRICTS:
        assert district_counts[d["postalCode"]] >= 3, (
            f"Too few listings for {d['postalCode']}: {district_counts[d['postalCode']]}"
        )

    balcony_pct = sum(1 for l in listings if l["characteristics"]["hasBalcony"]) / 50
    assert 0.55 <= balcony_pct <= 0.65, f"Balcony % out of range: {balcony_pct:.1%}"

    parking_pct = sum(1 for l in listings if l["characteristics"]["hasParking"]) / 50
    assert 0.35 <= parking_pct <= 0.45, f"Parking % out of range: {parking_pct:.1%}"

    elevator_pct = sum(1 for l in listings if l["characteristics"]["hasElevator"]) / 50
    assert 0.45 <= elevator_pct <= 0.55, f"Elevator % out of range: {elevator_pct:.1%}"

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(listings, f, indent=2, ensure_ascii=False)

    print(f"Written {len(listings)} listings to listings.json")
    print(f"Room distribution: {dict(sorted(room_counts.items()))}")
    print(f"Balcony: {balcony_pct:.0%}, Parking: {parking_pct:.0%}, Elevator: {elevator_pct:.0%}")


if __name__ == "__main__":
    main()
