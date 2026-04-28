# BeexStorage — Mobile App (Play Store)

Vite + React + Capacitor. Ships to Google Play Store as `io.beex.storage`.

## Stack

- **React 18** + **Vite** (JSX, no TypeScript)
- **Capacitor 6** for the Android wrapper
- **Inline CSS** via `src/styles.js` (no Tailwind here — see the website project for that)
- **localStorage** persistence under key `beex.state.v4`

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173 — confirm web build works
npm run build        # production bundle into /dist
```

## Demo accounts (per MVP v4.1 §1)

| Username | Password | Notes |
|----------|----------|-------|
| `adminx` | `12345`  | Dev bypass — skips all validation, has admin overlay |
| `Albi_student` | `demo` | Student role in Atila Electronics Lab |
| `Profesor_Klarensi` | `demo` | Teacher (owner) |
| `Shef_departamenti` | `demo` | HOD |
| `Financa_zyra` | `demo` | Finance |
| `Magazina_kryesore` | `demo` | Warehouse |

To reset all demo data: open dev console and run `localStorage.removeItem("beex.state.v4")`, then refresh.

## Building for Play Store

```bash
npm run build                # 1. Build the web bundle
npm run cap:add:android      # 2. One-time: scaffold the /android folder
npm run cap:sync             # 3. Copy web build into the Android project
npm run android:bundle       # 4. Produce the .aab → android/app/build/outputs/bundle/release/
```

You'll need **Android Studio** installed for step 4 and a signing key configured. The `/android` folder is gitignored — let your machine or CI regenerate it.

## What's in here

- `src/data.js` — mock DB layer (all roles, IDs, recipients are dynamic per MVP §0)
- `src/i18n.js` — English + Albanian (sq) translations
- `src/styles.js` — yellow/black brand theme (`#FFD93D` / `#FFC107` / `#1C1C1E`), responsive: bottom tabs on mobile, sidebar at ≥1024px
- `src/LoadingScreen.jsx` — splash with floating logo + progress bar
- `src/BeexStorageApp.jsx` — main component, all four tabs, all MVP features
- `src/App.jsx` — wraps loading → app
- `src/main.jsx` — Vite entry
- `capacitor.config.json` — `io.beex.storage`, splash + status bar config

## MVP v4.1 features implemented

- §0 Dynamic roles, storage IDs, order recipients
- §1 5-field signup with dev bypass
- §2 Universal scanner (camera + URL/ID parser); per-storage roles; public Storefront with join requests
- §3 RBAC pipeline Student → Teacher → HOD → Finance → Warehouse with warehouse selection
- §4 Admin god-mode overlay; member directory with search; **owner safety lock**
- §5 Manual quantity entry; sidebar at ≥1024px / bottom tabs on mobile; profile + password edit; soft deletes (30-day)

## Wiring up the real backend

Right now `src/data.js` mocks everything in localStorage. The constant `API` at the top points at your Render URL. To swap in real API calls, replace the `loadState`/`saveState` helpers and any `dispatch((s) => …)` calls with `fetch(API + "/…")` calls. The component code never touches `state` directly except through helpers — so the swap is contained to `data.js`.
