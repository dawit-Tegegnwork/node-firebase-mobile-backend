# Local demo (3 minutes)

This project is **emulator-first** — there is no public cloud deployment. Run locally with Firebase emulators.

## Prerequisites

- Node.js 20+
- Java (for Firestore emulator)

## One command

```bash
npm install
npm run demo
```

Or with Docker:

```bash
docker compose up --build
```

## Emulator UI

Open **http://127.0.0.1:4000** — Firebase Emulator Suite.

Ports:

| Service | Port |
|---------|------|
| Emulator UI | 4000 |
| Firestore | 8080 |
| Auth | 9099 |

## Seed demo data

In a second terminal (while emulators run):

```bash
npm run seed:emulator
```

## Run tests

```bash
npm test
```

## What to show recruiters

1. Emulator UI with Firestore collections
2. Cloud Function trigger on trip status change
3. Security rules tested via integration tests

**Synthetic transport data only.**
