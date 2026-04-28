# BeexStorage — Desktop Website

Vite + React + Tailwind. Marketing landing page + full app in a desktop-first layout.

## Stack

- **React 18** + **Vite** (JSX, no TypeScript)
- **Tailwind CSS 3** with a custom `beex-*` color palette
- **Inter** font from Google Fonts
- **localStorage** persistence under key `beex.state.v4` (shared key with the mobile app)

## Quick start

```bash
npm install
npm run dev          # http://localhost:5174
npm run build        # production bundle into /dist
npm run preview      # serve /dist locally on port 4173
```

Deploy `/dist` to any static host (Vercel, Netlify, Render Static Sites, GitHub Pages…).

## Demo accounts

Same as the mobile app. `adminx` / `12345` is the dev bypass.

## What's in here

- `src/data.js` — same mock DB layer as the mobile app
- `src/i18n.js` — English + Albanian, plus extra landing-page strings
- `src/index.css` — Tailwind base + custom component classes (`btn-primary`, `card`, `input-base`, `pill`, `sidebar-item`, `gradient-hero`)
- `src/LoadingScreen.jsx` — animated splash screen
- `src/BeexStorageWebsite.jsx` — the whole app: landing → login/signup → 4-tab dashboard
- `src/App.jsx` — wraps loading → app
- `src/main.jsx` — Vite entry
- `tailwind.config.js`, `postcss.config.js` — Tailwind setup

## Layout

- **Landing page** at `/` — hero, three feature cards, footer, CTAs to Login / Sign Up
- **Auth screens** — full-screen yellow gradient with centered card
- **Main app** — persistent 288px sidebar at `lg` breakpoint, hamburger drawer on mobile
- **Dark mode** — toggled in Settings, sets `data-dark="true"` on `<html>`
