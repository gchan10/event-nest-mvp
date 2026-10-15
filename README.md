# NestKit — Baby Gear, Sorted.

Mobile-first web app for expecting and new parents: know what you need, what you have, and where you put it.

React + TypeScript + Vite + Tailwind + Lucide. Data is saved in this browser's localStorage (not synced; use Settings → Export to back up).

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build into dist/
```

## Deploy to Vercel

1. Go to vercel.com → **Add New… → Project** → import this GitHub repo.
2. Vercel detects Vite automatically (build: `npm run build`, output: `dist`). Click **Deploy**.
3. Open the URL on your iPhone → Share → **Add to Home Screen** for an app-like experience.

Every push to the connected branch redeploys automatically.

## Code map

- `src/types.ts` — data models (profile, catalog, inventory, locations, containers)
- `src/lib/storage.ts` — the only persistence code (versioned schema + migration). Swap for Supabase here.
- `src/store.tsx` — app state and all actions
- `src/lib/derive.ts`, `src/lib/search.ts` — checklist/coverage/age logic and search
- `src/data/catalog.ts` — ~50 curated essentials; `src/data/demo.ts` — demo household
- `src/screens/*`, `src/sheets/*` — UI

Checklist decisions are derived from inventory items linked by `catalogId`, so the checklist and My Stuff never disagree. Items in a box reference the box, so moving a box moves everything in it. Demo data lives under a separate storage key from your own data.
