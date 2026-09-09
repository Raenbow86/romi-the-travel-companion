# Hello, Grok Bot

Angela (`Raenbow86`) is bringing you onto **ROMI — The Travel Companion**.

You are joining a live project, not a blank canvas. Read this whole file before you change anything. Then read [README.md](./README.md), [ROMI-PRODUCT-BRIEF.md](./ROMI-PRODUCT-BRIEF.md), [ROADMAP.md](./ROADMAP.md), and [SCOUT-PIPELINE.md](./SCOUT-PIPELINE.md).

Live app: https://romi-the-travel-companion.vercel.app/  
Repo: https://github.com/Raenbow86/romi-the-travel-companion  
Vercel deploys `main`. The app lives in `romi-app/`.

If you are unsure, ask Angela. Do not invent places. Do not “improve” the visual system. Do not rush the AI companion.

---

## Who Angela is

Angela is building ROMI for the first time. She is not a GitHub person by trade. She works at Three Rivers Resort in Almont, Colorado, meets seasonal travelers constantly, and has a real Paonia / Gunnison / Salida life on the road. Walk her through steps. Do not dump jargon. Do not wipe her form. Do not surprise-revert history.

Kai is a trusted reader of the product. When Kai speaks, listen. His line that we are protecting:

> ROMI’s special sauce is not “another map” — it’s trustworthy travel help.

---

## What ROMI is

A mobile-first companion for nomads, RVers, campers, seasonal workers, and tired travelers who need the next honest stop: sleep, water, shower, food, fuel, power, Wi‑Fi, laundry, dog needs, adult-friendly, adventure.

**Teal = scout verified.** A real person went. ROMI will stand behind it.  
**Orange = Google lead.** Useful, not confirmed. Needs a scout.

Google category labels are leads to filter, never ROMI’s truth.

Two kinds of contribution (do not mix them):

1. **Scouts** confirm the *place* (pull-through, dogs, hours, would you go back, freeform notes). Angela reviews before it becomes teal.
2. **Community** leaves stars + a written review on teal places. No points. Thank you. Inside notes — campsite 10 vs campsite 1 — belong here.

If a teal place looks stale (closed, different restaurant, wrong pin), community taps **Needs a new scout** + why. That goes **to Angela first**. She **Send to scouts** or **Keep it**. Nothing auto-magics to teal or to Scout World.

---

## What’s already built (do not rebuild)

Three tabs: **Explore · Plans · Scouts**

**Explore**
- One screen: where you are, what you need, the map, then the card
- Any town or ZIP, or use my location — not only test towns
- Need chips + type-to-tap place search (suggestions must sit *over* the map)
- Plain map pins: teal dots and orange dots. No emoji pins for now.
- Cards open for hours, website, traveler reviews
- **Scout it** on a lead fills the scout form with that place, that town, that pin — not the user’s current GPS

**Plans**
- Save a place or a day. Opening a saved day is its own view, not one endless page of everything.

**Scouts**
- The form only. No points, gifts, or founding-perk UI on this screen.
- Quiet labels. No “type AL / don’t guess the ZIP” helper copy.
- Tap-to-pick place and town from Google + gold list
- Hours: show Google’s week → “Are these hours right?” Yes keeps them. No opens edit.
- Notes are a blank box. No word-chip bubbles. We will teach filters from their words later.
- Incomplete submit must **keep the answers**. Never wipe the form.
- Reports can leave the phone (email + optional database). See SCOUT-PIPELINE.md.

**Reviews** (teal only)
- Stars + blank note. No hints in the placeholder.
- Sort Recent / Oldest
- Thank you. No points.

**Gold list** — real trips only. Do not add a stop unless Angela confirms she physically went.

Gunnison / Almont: Lodgepole Campground, Three Rivers Resort, The Powerstop (fuel + the burgers).  
Paonia / North Fork: Paonia Bread Works (standout), Paonia town, Orchard Valley Farms, The Storm Cellar, Big B’s Delicious Orchards, Farm Runners Station, Mesa Winds, Pickin’ in the Park, Curecanti — Pine Point, Cedaredge (town pin; exact in-town stop still TBD).

Do not add “the pizza place.” Unconfirmed.

---

## Product decisions already made

- Founding Five (first ~4–5 scouts): AI Premium free for life. Promised. Not shown on the Scouts screen.
- Later: points toward discounts, giftable Premium tries. Off the form until the form is boringly solid.
- ROMI email (`angela@…`) still to set up. Scout traffic should go there, not her personal pile.
- Filter engine is the biggest gap. Chips, list, and pins must share **one** definition of each need.
- Example Angela still feels: Dog Needs → Vet must return vets, not dog parks. Shower must not return Valley Glass.
- Test the same searches in Salida (81201), Gunnison, Paonia, a ZIP, and “use my location.”
- AI companion (talk-to-ROMI, scouting hunts, “you’re rolling into town”) is **later**. First make ROMI answer: *I’m here. I need this. Show me the right kind of place.*

---

## The whole plan

### Now
Accuracy. One filtered-results engine. Define each chip in plain English before coding. Protect teal vs orange.

### Next
Scout accounts so founding scouts can log in, send a report, and Angela can check it. ROMI inbox email. Founding-scout note (and later the training video). Keep the form clean.

### Then
Points, gifts, scouting games — after accounts and accuracy.

### Later
Premium AI ROMI: talk like Angela talks to Grok, get a mapped day, get pinged for unscouted stops nearby. Only after the world under the AI is trustworthy.

Soft launch crowd: nomads, RVers, seasonal people Angela already meets at Three Rivers.

---

## How to work in this repo

- App code: `romi-app/app/page.tsx` (UI), `romi-app/app/RomiMap.tsx` (pins), `romi-app/app/api/*` (Google + scout reports), `romi-app/app/review/` (Angela queue).
- Env: `GOOGLE_PLACES_API_KEY`, plus Resend / `REVIEW_INBOX` / optional `DATABASE_URL` and `REVIEW_SECRET`. Never commit keys.
- Small, reversible commits. We already survived a PLACEHOLDER commit (`2a45c70`) that blanked the app and a Vercel failure email. Restore, don’t rewrite history, unless Angela explicitly asks.
- Walk Angela step by step if she is doing something on GitHub, Vercel, or Google Cloud.
- If you change the scout form, keep answers on failed validation, pin the *place*, and leave notes freeform.

Welcome to the road, Bot. Make ROMI more honest, not more crowded.
