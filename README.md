# Ali'i Drive Racer

A small arcade driving game on Ali'i Drive at Magic Sands Beach (La'aloa Beach Park),
Kailua-Kona, Hawai'i. The world is Google Photorealistic 3D Tiles, streamed live and
rendered with three.js + [`3d-tiles-renderer`](https://github.com/NASA-AMMOS/3DTilesRendererJS) (pinned to 0.5.3).

Status: **Phase 1** (3D tiles + free-fly camera). Car, road logic and game layer come next.

## Run it

Needs Node 18+ (tested with Node 22) and Chrome.

```bash
npm install
cp .env.example .env      # then paste your key into .env
npm run dev
```

Open http://localhost:5173 in Chrome.

## Google Cloud setup

1. Go to https://console.cloud.google.com/ and create a project (or pick one).
2. **Billing**: attach a billing account to the project (Billing > Link a billing account).
   The Map Tiles API will not serve tiles without it.
3. **Enable the API**: APIs & Services > Library > search **Map Tiles API** > Enable.
4. **Create a key**: APIs & Services > Credentials > Create credentials > API key.
5. **Restrict the key** (do this, the key ships to the browser):
   - Application restrictions: **Websites**, add `http://localhost:5173/*`
     (plus any real domain you deploy to).
   - API restrictions: **Restrict key** > select only **Map Tiles API**.
6. Put it in `.env` as `VITE_GOOGLE_MAPS_KEY=...`. `.env` is gitignored. Never commit it.
7. Optional but smart: set a budget alert under Billing > Budgets & alerts.

Pricing changes over time, so check Google's current Map Tiles API pricing page before
playing a lot. The app creates the 3D tileset exactly once per page load, because each
root tileset request is billed.

## Controls (phase 1, free-fly)

| Input | Action |
| --- | --- |
| Click | capture mouse for looking around (Esc releases) |
| WASD / arrows | move |
| Q / E | down / up |
| Shift | fly fast |
| P | jump back to spawn |
| M | toggle red spawn marker |
| 1 / 2 / 3 | quality low / medium / high |

## Rules this project follows

- Nothing from Google is downloaded, cached or saved to disk by this app. Tiles stream at
  runtime through `3d-tiles-renderer`'s `GoogleCloudAuthPlugin`.
- The Google Maps logo (Google's official attribution asset, in `public/attribution/`) and
  the live per-tile copyright text are always shown at the bottom of the screen.
- Road data © OpenStreetMap contributors (ODbL). Used only for invisible game logic.
- The car is an original low-poly model built in code.

## Notes

- World origin: 19.593962, -155.971255, which is the Ali'i Drive centerline next to Magic
  Sands (the Wikipedia coordinate sits about 17 m west, on the sand). Axes: +Y up, +Z north, +X west.
- `npm install` copies three.js's Draco decoder into `public/draco/` (gitignored) so tile
  geometry decodes locally.
