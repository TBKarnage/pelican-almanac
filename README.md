# Pelican Almanac — Stardew Valley 1.6 Companion

[![CI](https://github.com/TBKarnage/pelican-almanac/actions/workflows/ci.yml/badge.svg)](https://github.com/TBKarnage/pelican-almanac/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

A personalized, offline-ready **Stardew Valley (Update 1.6)** interactive wiki, farm tracker, bundle checklist, 4-season calendar, friendship & heart events manager, searchable pan/zoom atlas map, and field journal tailored for iPad and desktop.

---

## Features

- **Today Hub & Live Valley Clock:** Track your current farm profile, year, season, day, and weather (including Green Rain) with quick day-stepping controls.
- **Sortable Encyclopedia:** Browse and track crops, fish, and catalog items with filtering and completion counts.
- **Community Center & Remixed Bundles:** Track standard, remixed, and Joja routes with live room/bundle progress.
- **4-Season Calendar:** Keep track of villager birthdays, festivals, and custom reminders.
- **Villagers & Friendship Tracker:** Manage heart levels, gift preferences, and heart events across Pelican Town.
- **Interactive Atlas Map:** Pan and zoom across valley locations with cross-linked pins for villagers and items.
- **Guides & Field Journal:** Built-in reference guides alongside personal farm notes.
- **Global Search & Themes:** Jump anywhere via `⌘K` / `Ctrl+K` (or `/`), and switch between **Pelican Parchment** (daylight) and **Moonlight Cabin** (dark) themes.
- **Save Import & Backup:** Import Stardew Valley XML save files and export/import full JSON backups across devices.
- **Offline-Ready PWA:** Installable on iPadOS via Safari's **Add to Home Screen** with Service Worker caching.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 8, `lucide-react`
- **Linting:** `oxlint`
- **Deployment:** Node.js LAN host script (`scripts/host-local.mjs`) or Docker (`node:22-alpine` → `nginx:1.27-alpine`)

---

## Local Development

Requires **Node.js 20.19+ or 22.12+** (Node 22 LTS recommended).

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Run linter
npm run lint

# Type-check and build production bundle
npm run build

# Preview production bundle
npm run preview
```

---

## Option 1: Host Temporarily from Your Computer (for iPad on Wi-Fi)

You only need **Node.js 20.19+ (or 22+)** installed on your computer. Your iPad should be on the same Wi-Fi network.

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Build the production bundle and start the LAN server on port 4173
npm run host
```

> Already built `dist/`? Start immediately without rebuilding via `npm run host:quick` (or pick a custom port with `node scripts/host-local.mjs --port 8080`).

When started, the terminal prints your computer's local Wi-Fi address, for example:
```text
iPad/LAN: http://192.168.1.42:4173
```

### Opening on Your iPad
1. Open **Safari** on your iPad and visit the printed `iPad/LAN` URL.
2. Tap **Share → Add to Home Screen** to launch Pelican Almanac full-screen with your saved farm profiles and icons.
3. If your iPad cannot connect, allow Node / port `4173` through your computer's firewall (macOS System Settings → Network → Firewall, or Windows Defender Firewall prompt).

### Optional HTTPS on LAN (Enables Full Offline Service Worker Caching in iPadOS)
Over plain `http://<LAN-IP>`, iPad Safari opens the app full-screen and saves all farm data in `localStorage`, while the Service Worker offline cache requires `https://`:
1. Generate a local cert trusted on your LAN (for example using `mkcert`) and place `cert.pem` and `key.pem` inside `./certs/`.
2. Run:
   ```bash
   node scripts/host-local.mjs --https
   ```

---

## Option 2: Deploy with Docker

A multi-stage `Dockerfile` (Node builder → lightweight Nginx Alpine), `nginx.conf`, and `compose.yaml` are included.

### Using Docker Compose (Recommended)
```bash
docker compose up -d --build
```
The app will be served on `http://<your-server-ip>:4173` (override the port with `PORT=8080 docker compose up -d --build`).

### Using Plain Docker CLI
```bash
docker build -t pelican-almanac .
docker run -d --name pelican-almanac -p 4173:80 --restart unless-stopped pelican-almanac
```

> Put your Docker container behind a reverse proxy with HTTPS (Caddy, Traefik, Nginx Proxy Manager, or Tailscale Serve) if you want full Service Worker offline caching on iPadOS.

---

## Moving Your Saved Data from Computer Host → Docker

Browser `localStorage` is isolated per URL/origin. When switching from temporary local hosting to Docker:
1. Open **Farm Profiles & Settings** (`⚙` in the top bar) on your old URL and click **Export JSON Backup**.
2. Open the new Docker URL and use **Import JSON Backup** in the same modal to restore every farm profile, bundle check, heart level, reminder, and journal entry.

---

## Project Structure

```text
pelican-almanac/
├── public/              # PWA manifest, Service Worker (sw.js), and app icons
├── scripts/             # Local LAN hosting server (host-local.mjs)
├── src/
│   ├── components/      # Views (Today, Encyclopedia, Bundles, Calendar, Map, etc.) & modals
│   ├── data/            # Stardew Valley 1.6 datasets (crops, fish, bundles, villagers, map pins)
│   ├── state/           # Farm profile store & persistence provider
│   ├── styles/          # Theme tokens, layout, and component stylesheets
│   ├── types/           # TypeScript domain types
│   └── utils/           # Calculations and Stardew XML save importer
├── Dockerfile           # Multi-stage Node + Nginx build
├── compose.yaml         # Docker Compose deployment configuration
└── nginx.conf           # Nginx static & PWA caching rules
```

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) and review the [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request.

For security concerns, see [SECURITY.md](SECURITY.md).

## License

This project is licensed under the [MIT License](LICENSE).
