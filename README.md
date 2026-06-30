# Node Firebase Mobile Backend

Synthetic transport domain backend built with **Node.js**, **TypeScript**, and the **Firebase Emulator Suite**. No production Firebase project is required — all development and tests run locally against emulators.

[![Tests](https://github.com/dawit-Tegegnwork/node-firebase-mobile-backend/actions/workflows/test.yml/badge.svg)](https://github.com/dawit-Tegegnwork/node-firebase-mobile-backend/actions/workflows/test.yml)

This is a **production-style portfolio project** using **synthetic transport data** on the **Firebase Emulator Suite** — a reference implementation for mobile-backend patterns, not a deployed production Firebase project.

## Live Demo

| Channel | URL |
|---------|-----|
| **Cloud live demo** | Not configured — **local emulator demo only** |
| **Emulator UI** | http://127.0.0.1:4000 after `npm run demo` |

## Quick Test in 3 Minutes

```bash
npm install && npm install --prefix functions
npm run demo
# new terminal:
FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 npm run seed:emulator
```

1. Open http://127.0.0.1:4000 — Firebase Emulator UI  
2. Inspect `trips` collection with seeded synthetic routes  
3. Run `npm test` — emulator-backed integration tests  

## Production-Style Features

- TypeScript Cloud Functions (v2)  
- Firestore security rules tested against emulator  
- Seed script for repeatable demo data  
- GitHub Actions CI with emulator  
- `.env.example` for local configuration  

## Health Check

Emulator health is verified via the Emulator UI (port 4000) and `npm test`. No cloud `/health` endpoint — by design for local-only demo.

## Synthetic Data Notice

All trips, drivers, and passengers are **synthetic**. No production Firebase project or real user data is used.

## What Recruiters Can Evaluate

- Node.js + TypeScript backend structure  
- Firebase Functions and Firestore patterns  
- Emulator-based testing workflow  
- Mobile-backend API design for transport domain  

## Demo scenario (3–5 minutes)

1. `npm install` at repo root, then `npm install --prefix functions`
2. `npm run demo` — starts Firebase emulators
3. In another terminal: `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 npm run seed:emulator`
4. Open Emulator UI at http://127.0.0.1:4000 — inspect trips collection

## Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20+ |
| Language | TypeScript |
| Database | Cloud Firestore (emulator) |
| Server logic | Cloud Functions v2 (emulator) |
| Auth | Firebase Auth (emulator, for rules testing) |

## Roles

| Role | Description |
|------|-------------|
| **admin** | Full access — manage users, trips, tickets, delete records |
| **dispatcher** | Create and manage trips, handle support tickets |
| **driver** | View assigned trips, update status (`en_route`, `completed`) |

See [docs/data-model.md](docs/data-model.md) for collection schemas.

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`

## Setup

```bash
# Clone and enter the repo
cd node-firebase-mobile-backend

# Install root + functions dependencies
npm install --prefix functions

# Build TypeScript Cloud Functions
npm run build
```

## Emulator Commands

Start all configured emulators (Firestore, Functions, Auth, Emulator UI):

```bash
firebase emulators:start
```

Start a subset:

```bash
firebase emulators:start --only firestore,functions
```

| Service | Port |
|---------|------|
| Emulator UI | 4000 |
| Firestore | 8085 |
| Functions | 5001 |
| Auth | 9099 |

The project ID defaults to `demo-transport` (see `.firebaserc`).

## Tests

Tests run against the Firestore emulator via `firebase emulators:exec`:

```bash
npm test
```

This compiles functions, starts the Firestore emulator, runs unit/integration tests, then shuts down.

## Project Layout

```
├── firebase.json          # Emulator + deploy config
├── firestore.rules        # Security rules
├── firestore.indexes.json # Composite indexes
├── functions/
│   ├── src/
│   │   ├── index.ts              # Cloud Function exports
│   │   ├── tripNotifications.ts  # Trip status → notification logic
│   │   └── types.ts              # Domain types & helpers
│   └── test/
│       └── onTripStatusChange.test.ts
└── docs/
    ├── data-model.md
    ├── security-rules.md
    └── functions.md
```

## Domain Overview

This is a **synthetic transport** backend (fictional fleet/dispatch scenario):

- **Trips** — pickup/dropoff requests with lifecycle status
- **Support tickets** — driver/dispatcher help requests
- **Notifications** — auto-created when trip status changes (Cloud Function)

## Documentation

- [Data model](docs/data-model.md) — collections, fields, status flows
- [Security rules](docs/security-rules.md) — role-based access explained
- [Cloud Functions](docs/functions.md) — triggers and notification logic

## Example Client Flow (Emulator)

1. Seed a user document in Firestore with a `role` field (`admin`, `dispatcher`, or `driver`).
2. Authenticate via the Auth emulator with a matching UID.
3. Create a trip (`status: requested`) as dispatcher.
4. Assign a driver and update status — the `onTripStatusChange` function creates notification documents.
5. Open support tickets as any signed-in user.

Use the Emulator UI at http://localhost:4000 to inspect Firestore data and function logs.

## License

MIT — portfolio / demonstration project only.
