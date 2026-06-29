# Cloud Functions

TypeScript Cloud Functions live under [`functions/`](../functions/). Built output is emitted to `functions/lib/`.

## Exported Functions

### `onTripStatusChange`

| Property | Value |
|----------|-------|
| Trigger | Firestore `onDocumentUpdated` |
| Path | `trips/{tripId}` |
| Region | `us-central1` |

**Behavior**

1. Fires when any trip document is updated.
2. Compares `before.status` and `after.status`.
3. If unchanged, exits without writing.
4. If changed, creates one notification per recipient:
   - `trip.createdBy` (dispatcher/admin who created the trip)
   - `trip.driverId` (if assigned)

**Notification payload**

```typescript
{
  type: "trip_status_changed",
  recipientId: string,
  tripId: string,
  previousStatus: TripStatus,
  newStatus: TripStatus,
  message: string,        // e.g. "Trip abc moved from Requested to Assigned."
  read: false,
  createdAt: Timestamp
}
```

## Module Structure

```
functions/src/
├── index.ts              # Firebase function exports
├── tripNotifications.ts  # Handler + testable core logic
└── types.ts              # Domain types, transition helpers
```

Core logic is extracted into `handleTripStatusChange()` so it can be tested against the Firestore emulator without deploying.

## Local Development

```bash
# Build
npm run build --prefix functions

# Run emulators (Firestore + Functions)
firebase emulators:start --only firestore,functions
```

When the Functions emulator is running, updating a trip document in Firestore triggers `onTripStatusChange` automatically. Check function logs in the terminal or Emulator UI.

## Testing

```bash
npm test   # from repo root — wraps tests in firebase emulators:exec
```

Tests in `functions/test/onTripStatusChange.test.ts`:

- Invoke `handleTripStatusChange` directly against the Firestore emulator
- Assert notification documents are created with correct fields
- Assert no writes when status is unchanged

## Deployment Note

This repository targets **emulator-only** workflows. To deploy to a real Firebase project you would:

1. Create a Firebase project and update `.firebaserc`
2. Run `firebase deploy --only functions,firestore:rules,firestore:indexes`

The `predeploy` hook in `firebase.json` runs `npm run build` in `functions/` automatically.
