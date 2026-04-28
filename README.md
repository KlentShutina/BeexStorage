# BeexStorage v2.0

Smart inventory management for schools, labs, and warehouses. Multi-storage hardware, role-based pipelines, admin dashboard. Available as a desktop website and a Play Store mobile app, sharing a Postgres backend on Render + Supabase.

```
BeexStorageV2.0/
├── inventory-app/        ← Mobile app (Vite + React + Capacitor) → Play Store
├── inventory-website/    ← Desktop website (Vite + React + Tailwind) → Vercel/Netlify
├── inventory-backend/    ← Express + Prisma + Postgres → Render
├── .gitignore
└── README.md
```

---

## ⚠ Read this first — security cleanup

Your previous `inventory-backend/.env` was committed inside the repo zip with a real Supabase password. **You must:**

1. Open Supabase → Project Settings → Database → Reset database password.
2. Update the new password in Render's Environment tab (don't put it back in `.env`).
3. Make sure `.env` is listed in `.gitignore` (it is in this version).
4. If you already pushed the old `.env` to GitHub, also rewrite history: `git rm --cached inventory-backend/.env`, commit, then force-push. The password is rotated regardless.

This v2.0 layout never commits `.env`. The template you fill in locally is `inventory-backend/.env.example`.

---

## What changed from v1

- **Dark mode bug fixed.** The website previously kept dark text on dark backgrounds. Tailwind's `dark:` variants are now wired to your `[data-dark="true"]` toggle (in `tailwind.config.js`), and component colors flip automatically via CSS variables in `src/index.css`. Toggle dark mode in **Settings → Dark Mode** to verify.
- **Real backend.** `inventory-backend/index.js` now exposes the full API the frontends need: snapshot, scanner, inventory CRUD, orders, hierarchy. The Prisma schema models per-storage roles, soft deletes, order events, and warehouses (your old schema only had flat User/Storage/Drawer/Order).
- **Owner safety lock enforced server-side** (MVP §4) — the API refuses to demote the original storage owner.
- **API client bundled in both frontends** as `src/api.js`. The frontends still default to localStorage mode for easy demos; flip `VITE_USE_API=true` to talk to Render.

---

## Quick local setup (15 minutes)

### 1. Backend

```bash
cd inventory-backend
npm install
cp .env.example .env
#  → edit .env and paste your Supabase DATABASE_URL + DIRECT_URL
npx prisma migrate dev --name init     # creates tables on Supabase
npm run dev                            # runs at http://localhost:10000
curl -X POST http://localhost:10000/api/seed   # populates demo data
```

### 2. Website

```bash
cd ../inventory-website
npm install
npm run dev                            # runs at http://localhost:5174
```

### 3. Mobile app (browser preview)

```bash
cd ../inventory-app
npm install
npm run dev                            # runs at http://localhost:5173
```

Login with `adminx` / `12345` to land in the admin god-mode view.

---

## Switching the frontends from localStorage to the real API

Both frontends ship a ready-to-use `src/api.js` that wraps every backend endpoint. The components currently use `src/data.js` (localStorage). To switch:

**A) Quick way — point the existing `loadState`/`saveState` at the API:**

In `src/data.js`, replace `loadState` and `saveState`:

```javascript
import { api } from "./api";

let cachedState = null;

export async function loadState(userId) {
  if (cachedState) return cachedState;
  const { state } = await api.snapshot(userId || "u_admin");
  cachedState = state;
  return state;
}

export async function saveState(state) {
  // No-op when using API — server is the source of truth
  cachedState = state;
}
```

Then in `BeexStorageApp.jsx` / `BeexStorageWebsite.jsx`, change:
```javascript
const [state, setState] = useState(loadState);   // before
```
to:
```javascript
const [state, setState] = useState({ users: [], storages: [], orders: [] });
useEffect(() => {
  if (currentUser) api.snapshot(currentUser.id).then(({ state }) => setState(state));
}, [currentUser]);
```

**B) Full way — replace each `dispatch((s) => …)` call with the matching `api.*` call.** This is more work but gives you proper error handling and optimistic UI. The structure of `api.js` mirrors the dispatch patterns one-for-one.

I recommend starting with (A) so you can ship, then migrate to (B) endpoint-by-endpoint.

---

## Deployment

### Backend → Render

1. Push this repo to GitHub.
2. On Render → **New → Web Service** → connect your GitHub repo.
3. Settings:
   - **Root directory:** `inventory-backend`
   - **Build command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start command:** `npm start`
   - **Environment:** Node 20+
4. Add Environment Variables:
   - `DATABASE_URL` — Supabase pooled connection (port 6543, with `?pgbouncer=true`)
   - `DIRECT_URL` — Supabase direct connection (port 5432)
   - `PORT` — leave unset, Render assigns it automatically
5. After first deploy succeeds, hit the seed endpoint once: `curl -X POST https://YOUR-SERVICE.onrender.com/api/seed`
6. Note the URL Render gives you (e.g. `https://beex-storage-backend.onrender.com`).

**Render free tier note:** the service sleeps after 15 min of inactivity, then takes ~30s to wake up on the first request. Fine for demos. Upgrade to the Starter plan ($7/mo) for always-on.

### Website → Vercel (or Netlify)

```bash
cd inventory-website
echo "VITE_API_URL=https://YOUR-SERVICE.onrender.com/api" > .env.production
echo "VITE_USE_API=true" >> .env.production
```

Then either:

- **Vercel CLI:** `npx vercel --prod` from inside `inventory-website/`
- **Vercel dashboard:** Import the repo, set the root to `inventory-website`, framework to Vite, add the same two env vars in the dashboard.

Build command: `npm run build`. Output dir: `dist`.

### Mobile app → Google Play Store

The Play Store requires an Android Studio install and a signing key. Once you have those:

```bash
cd inventory-app

# 1. Set your prod API URL
echo "VITE_API_URL=https://YOUR-SERVICE.onrender.com/api" > .env.production
echo "VITE_USE_API=true" >> .env.production

# 2. Build the web bundle
npm run build

# 3. First time only — scaffold Android project
npm run cap:add:android

# 4. Sync the build into the Android project
npm run cap:sync

# 5. Open in Android Studio to configure signing
npx cap open android
```

In Android Studio:
- Open `android/app/build.gradle` and set `applicationId` to `io.beex.storage`.
- Generate a keystore: **Build → Generate Signed Bundle/APK → Android App Bundle → Create new…** (save the keystore file outside the repo!).
- Build → Generate Signed Bundle/APK → choose "release" → it produces `android/app/release/app-release.aab`.

Upload that `.aab` to the [Google Play Console](https://play.google.com/console). You'll need a $25 one-time developer registration.

For the listing you'll need:
- App icon: 512×512 (your logo works — `inventory-app/public/logo.png`)
- Feature graphic: 1024×500
- 2+ screenshots (Phone, 16:9 or 9:16)
- Short description (≤80 chars), full description (≤4000 chars)
- Privacy policy URL (e.g. host a single HTML page on your site)

---

## Demo accounts (after running `/api/seed`)

| Username | Password | Role in Atila Lab |
|----------|----------|-------------------|
| `adminx` | `12345` | Dev bypass (admin everywhere) |
| `Albi_student` | `demo` | Student |
| `Profesor_Klarensi` | `demo` | Teacher (owner — safety locked) |
| `Shef_departamenti` | `demo` | HOD |
| `Financa_zyra` | `demo` | Finance |
| `Magazina_kryesore` | `demo` | Warehouse |

---

## Before you go public — production checklist

- [ ] Reset Supabase database password and update Render env vars
- [ ] Verify `.env` is gitignored and not in any commit
- [ ] Replace plain-text passwords with `bcrypt.hash` in `index.js` (login + register + change-password) — keep the demo accounts working by re-running `/api/seed`
- [ ] Add JWT or session tokens; gate the inventory and admin endpoints behind a middleware that checks the caller's membership
- [ ] Set CORS origin allow-list in `index.js` to your production website domain only (currently allows all)
- [ ] Add rate-limiting (`express-rate-limit`) on `/api/login` and `/api/register`
- [ ] Set up a Privacy Policy page (Play Store requires it)
- [ ] Test the dark mode toggle in both frontends after the API swap
- [ ] Test offline behavior on the mobile app — Capacitor caches the web bundle but API calls will fail with no network

---

## Languages

English (`en`) and Albanian (`sq`). Toggle in **Settings → Language**.

## License

Private — all rights reserved.
