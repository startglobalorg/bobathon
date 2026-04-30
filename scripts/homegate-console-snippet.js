// Paste this into the browser DevTools console on any Homegate listing detail page
// e.g. https://www.homegate.ch/mieten/3xxxxxxxxx
// Works with Homegate's Vue.js frontend.

(function () {
  const KREISE = {"8001":"Kreis 1","8002":"Kreis 2","8003":"Kreis 3","8004":"Kreis 4","8005":"Kreis 5","8006":"Kreis 6","8008":"Kreis 8","8032":"Kreis 7","8044":"Kreis 7","8045":"Kreis 2","8047":"Kreis 9","8048":"Kreis 9","8049":"Kreis 10","8050":"Kreis 11","8051":"Kreis 12","8052":"Kreis 12","8053":"Kreis 7","8055":"Kreis 3"};

  function distKm(lat, lng) {
    const dLat = (lat - 47.3769) * Math.PI / 180;
    const dLng = (lng - 8.5417) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(47.3769*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLng/2)**2;
    return Math.round(6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))*10)/10;
  }

  function text(selector) {
    return document.querySelector(selector)?.textContent?.trim() ?? "";
  }

  // --- 1. Try JSON-LD structured data (most reliable) ---
  let fromSchema = null;
  for (const el of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const s = JSON.parse(el.textContent);
      const items = Array.isArray(s) ? s : [s];
      for (const item of items) {
        const t = (item["@type"] ?? "").toLowerCase();
        if (t.includes("apartment") || t.includes("house") || t.includes("realestate") || t.includes("residence")) {
          fromSchema = item; break;
        }
      }
    } catch {}
  }

  // --- 2. Try window state objects ---
  let fromState = null;
  for (const key of ["__INITIAL_STATE__", "__PRELOADED_STATE__", "__APP_STATE__", "__STATE__"]) {
    if (window[key]) { fromState = window[key]; break; }
  }

  // --- 3. DOM fallback: scrape visible page content ---
  const listingId = location.pathname.match(/\/(\d+)\/?$/)?.[1] ?? Date.now().toString();

  // Price
  let priceChf = 0;
  const priceEl = document.querySelector('[data-test="price"], .price, [class*="price"]');
  const priceText = (priceEl?.textContent ?? document.body.innerText).match(/CHF\s*([\d'\s]+)/i);
  if (priceText) priceChf = parseInt(priceText[1].replace(/['\s]/g, ""));

  // Rooms
  let rooms = 0;
  const roomsMatch = document.body.innerText.match(/(\d[\.,]?\d?)\s*Zimmer/i);
  if (roomsMatch) rooms = parseFloat(roomsMatch[1].replace(",", "."));

  // Size — find the largest m² number on the page (avoids picking up small noise values)
  let sizeSqm = 0;
  const sizeMatches = [...document.body.innerText.matchAll(/(\d{2,4})\s*m²/gi)];
  if (sizeMatches.length) sizeSqm = Math.max(...sizeMatches.map(m => parseInt(m[1])));

  // Address — strip leading label words like "Standort"
  const addrEl = document.querySelector('[data-test="address"], [class*="address"], [class*="location"]');
  const addressLine = (addrEl?.textContent?.trim() ?? text("h1"))
    .replace(/^(Standort|Adresse|Ort)[:\s]*/i, "").trim();

  // ZIP
  const zipMatch = addressLine.match(/\b(80\d{2})\b/) ?? document.body.innerText.match(/\b(80\d{2})\b/);
  const zip = zipMatch?.[1] ?? "8000";

  // Images
  const imgEls = [...document.querySelectorAll('img[src*="homegate"], img[src*="static-homegate"], img[src*="media"]')];
  const images = [...new Set(imgEls.map(i => i.src.split("?")[0]).filter(s => s.match(/\.(jpg|jpeg|webp|png)/i)))].slice(0, 5);

  // Coordinates — try JSON-LD, meta tags, and inline scripts
  let lat = 0, lng = 0;
  if (fromSchema?.geo) { lat = fromSchema.geo.latitude ?? 0; lng = fromSchema.geo.longitude ?? 0; }
  const metaLat = document.querySelector('meta[property="place:location:latitude"]')?.content;
  const metaLng = document.querySelector('meta[property="place:location:longitude"]')?.content;
  if (metaLat) lat = parseFloat(metaLat);
  if (metaLng) lng = parseFloat(metaLng);
  if (!lat) {
    // Try to find coordinates embedded in any inline script
    for (const s of document.querySelectorAll("script:not([src])")) {
      const m = s.textContent.match(/"latitude"\s*:\s*([\d.]+).*?"longitude"\s*:\s*([\d.]+)/s)
             ?? s.textContent.match(/lat[itude]*["']?\s*[:=]\s*(47\.[\d]+).*?l(?:ng|on)[gitude]*["']?\s*[:=]\s*(8\.[\d]+)/s);
      if (m) { lat = parseFloat(m[1]); lng = parseFloat(m[2]); break; }
    }
  }
  // Fall back to Zürich centre only if truly not found
  if (!lat) { lat = 47.376; lng = 8.541; }

  // Floor
  const floorMatch = document.body.innerText.match(/(\d+)\.\s*(?:OG|Obergeschoss|Etage)/i);
  const floor = floorMatch ? parseInt(floorMatch[1]) : 0;

  // Year built
  const yearMatch = document.body.innerText.match(/Baujahr[:\s]*(\d{4})/i) ?? document.body.innerText.match(/erbaut[:\s]*(\d{4})/i);
  const yearBuilt = yearMatch ? parseInt(yearMatch[1]) : 1975;

  // Description
  const descEl = document.querySelector('[data-test="description"], [class*="description"], [class*="text"]');
  const customNotes = (descEl?.textContent ?? "").trim().slice(0, 300);

  // Booleans from text
  const bodyText = document.body.innerText.toLowerCase();
  const balcony   = bodyText.includes("balkon") || bodyText.includes("terrasse");
  const parking   = bodyText.includes("parkplatz") || bodyText.includes("garage") || bodyText.includes("tiefgarage");
  const furnished = bodyText.includes("möbliert");
  const pets      = bodyText.includes("haustiere erlaubt") || bodyText.includes("tierfreundlich");
  const elevator  = bodyText.includes("lift") || bodyText.includes("aufzug");
  const laundry   = bodyText.includes("waschmaschine") || bodyText.includes("waschküche");
  const dishwasher = bodyText.includes("geschirrspüler") || bodyText.includes("spülmaschine");

  const result = {
    id: `hg-${listingId}`,
    heroImage: images[0] ?? "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    gallery: JSON.stringify(images.length > 0 ? images : ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]),
    sizeSqm: sizeSqm || (fromSchema?.floorSize?.value ?? 60),
    priceChf: priceChf || 0,
    rooms: rooms || 2.5,
    balcony, parking,
    addressLine: addressLine || `${zip} Zürich`,
    neighborhood: KREISE[zip] ?? "Zürich",
    lat, lng, floor,
    availabilityStart: new Date().toISOString(),
    availabilityDurationMonths: null,
    furnished, petsAllowed: pets,
    customNotes,
    yearBuilt,
    distanceFromCenterKm: distKm(lat, lng),
    hasDishwasher: dishwasher,
    hasLaundry: laundry,
    hasElevator: elevator,
  };

  const json = JSON.stringify(result, null, 2);
  console.log("%c✓ Listing extracted — prüfe die Felder und kopiere das JSON:", "color: green; font-weight: bold");
  console.log(json);

  navigator.clipboard?.writeText(json)
    .then(() => console.log("%c📋 In Zwischenablage kopiert!", "color: blue"))
    .catch(() => console.log("Bitte manuell kopieren (oben selektieren → Cmd+C)."));
})();
