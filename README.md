# Node Firebase Mobile Backend

Synthetic transport domain backend built with **Node.js**, **TypeScript**, and the **Firebase Emulator Suite**. No production Firebase project is required — all development and tests run locally against emulators.

[![Tests](https://github.com/dawit-Tegegnwork/node-firebase-mobile-backend/actions/workflows/test.yml/badge.svg)](https://github.com/dawit-Tegegnwork/node-firebase-mobile-backend/actions/workflows/test.yml)

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
