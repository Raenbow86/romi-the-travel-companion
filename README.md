# ROMI — The Travel Companion

Live app: [https://romi-the-travel-companion.vercel.app/](https://romi-the-travel-companion.vercel.app/)

ROMI helps people on the road find the next real stop — sleep, water, shower, food, fuel, dogs, laundry, adult-friendly, adventure — and tells the truth about whether a traveler has actually been there.

This is not another map. Google is a lead. A scout is the confirmation.

**Owner:** Angela (`Raenbow86`)  
**Status as of September 9, 2026:** working prototype on Vercel. Scout form, map, gold list, reviews, and Angela-first re-verify are in the app. Filter accuracy is the next hard problem. AI companion is later.

---

## The special sauce

| Color | Meaning |
| --- | --- |
| **Teal** | Scout verified. A real person went. ROMI will stand behind it. |
| **Orange** | Google lead. Useful, not confirmed. Needs a scout. |

Google category labels are never ROMI’s truth. They are leads to filter.

Two kinds of contribution:

1. **Scouts** confirm the place (pull-through, dogs, hours, would you go back, notes). Angela reviews before it becomes teal.
2. **Community** leaves stars and a written review on teal places. No points. Site 10 was quiet; site 1 sat by the dumpsters. If the place itself looks stale, they tap **Needs a new scout** — that goes to Angela first, then she can send it to Scout World.

---

## What’s in the app today

Three tabs: **Explore · Plans · Scouts**

### Explore
- One screen: where you are, what you need, the map, then the card
- Town or ZIP, or use my location
- Need chips: Sleep, Water, Shower, Food, Fuel, Power, Wi‑Fi & Cell, Laundry, Dog Needs, Adventure, Adult-friendly
- Radius around the chosen place (not “only our test towns”)
- Type-to-tap place search; suggestions sit over the map
- Plain map pins: teal verified, orange Google
- Cards: hours, Google rating as a lead, traveler stars once reviews exist
- **Scout it** on a lead fills the scout form with the place, town, and pin of *that* place (not current GPS)

### Plans
- Save a place or a day
- Open a saved day without dumping it onto one endless page with everything else

### Scouts
- The form only. Points, gifts, and founding perks stay off this screen.
- Tap-to-pick place and town (no “type AL…” helper text)
- What it helps with, I was there, pull-through, dogs, would you go back
- Hours: show Google’s week → **Are these hours right?** Yes keeps them. No opens an edit box.
- Notes are freeform. No word-chip bubbles.
- Incomplete send keeps the answers. It does not wipe the form.
- Reports can leave the phone (email + optional database). See [SCOUT-PIPELINE.md](./SCOUT-PIPELINE.md).

### Reviews (teal places only)
- Stars + a blank note. No hints in the box. Thank you. No points.
- Sort **Recent / Oldest**
- **Needs a new scout** + why → Angela inbox on that card → **Send to scouts** or **Keep it**

---

## Gold list (scout-verified, real trips)

Kept small on purpose. A few deeply useful places beat hundreds of random listings. Do not add a stop unless Angela confirms she physically went.

**Gunnison / Almont**
- Lodgepole Campground
- Three Rivers Resort
- The Powerstop (Gunnison) — fuel + the burgers locals rave about

**Paonia / North Fork wine country**
- Paonia Bread Works (standout)
- Paonia (town hub)
- Orchard Valley Farms & Market
- The Storm Cellar
- Big B’s Delicious Orchards
- Farm Runners Station
- Mesa Winds Farm & Winery
- Pickin’ in the Park
- Curecanti — Pine Point
- Cedaredge (town pin; exact in-town stop still TBD)

---

## Product decisions already made

- Founding Five (first ~4–5 scouts): AI Premium free for life. Not shown on the Scouts screen yet.
- Later: points for discounts, giftable Premium tries. Not on the form.
- ROMI email for scout traffic: still to set up (`angela@…`).
- Filter engine is not done. Chips, list, and pins must share one definition of each need (example: Dog Needs → Vet means veterinary clinics, not dog parks).
- Test the same searches in Salida (81201), Gunnison, Paonia, a ZIP, and “use my location.”
- Do not rush the AI companion. First make ROMI reliably answer: *I’m here. I need this. Show me the right kind of place.*

---

## Repo layout

```
README.md                 ← you are here
ROMI-PRODUCT-BRIEF.md     ← short mission
ROADMAP.md                ← what to build next
SCOUT-PIPELINE.md         ← how reports leave the phone
romi-app/                 ← Next.js app (this is what Vercel deploys)
  app/page.tsx            ← Explore / Plans / Scouts UI
  app/RomiMap.tsx         ← map pins
  app/api/                ← geocode, autocomplete, nearby, place, search, scout-reports
  app/review/             ← Angela’s review queue (needs REVIEW_SECRET)
```

---

## Run it locally

```bash
cd romi-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Vercel deploys from `main`. If production ever fails, check the commit — `2a45c70` was the old PLACEHOLDER break and is already undone.

### Environment (Vercel)

| Variable | What it’s for |
| --- | --- |
| `GOOGLE_PLACES_API_KEY` | Places, autocomplete, hours |
| `RESEND_API_KEY` | Scout report email |
| `REVIEW_INBOX` | Where scout mail goes |
| `RESEND_FROM` | Optional from-address |
| `DATABASE_URL` | Optional Postgres (Neon) for the review queue |
| `REVIEW_SECRET` | Password for `/review` |
| `NEXT_PUBLIC_APP_URL` | `https://romi-the-travel-companion.vercel.app` |

Never commit API keys. Restrict the Google key in Cloud Console.

---

## Next (in order)

1. **Accuracy, not new features.** One filtered-results engine for list, cards, and pins. Define each chip in plain English before coding it.
2. **Scout accounts** so founding scouts can log in, send a form, and Angela can check it.
3. **ROMI email** + founding-scout note (and the training video later).
4. **AI companion** only after the map answers the need honestly.

If you are Kai, Angela, or a founding scout: the live app is the source of truth. This README is the written snapshot of that app as of September 9, 2026.
