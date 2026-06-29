# Security Rules

Rules live in [`firestore.rules`](../firestore.rules). They enforce role-based access for the synthetic transport domain.

## Authentication

All rules assume Firebase Auth. User role is stored on `users/{uid}.role` and loaded via:

```
get(/databases/$(database)/documents/users/$(request.auth.uid)).data
```

Helper functions: `isAdmin()`, `isDispatcher()`, `isDriver()`, `isStaff()` (admin or dispatcher).

## Collection Policies

### Users

| Action | Who |
|--------|-----|
| Read own profile | Self |
| Read any profile | Staff |
| Create | Admin only |
| Update own profile | Self (cannot change `role`) |
| Update any profile | Admin |
| Delete | Admin |

### Trips

| Action | Who | Constraints |
|--------|-----|-------------|
| Read | Staff | All trips |
| Read | Driver | Own assigned trips only (`driverId == uid`) |
| Create | Staff | Must set `status: requested`, `createdBy == uid` |
| Update | Staff | Full update |
| Update | Driver | Own trip only; may change `status` + `updatedAt`; new status ∈ `{en_route, completed}` |
| Delete | Admin | — |

### Support Tickets

| Action | Who | Constraints |
|--------|-----|-------------|
| Read | Staff | All tickets |
| Read | Creator | Own tickets |
| Create | Any signed-in user | `status: open`, `createdBy == uid` |
| Update | Staff | Full update |
| Update | Creator | `body` + `updatedAt` only, while `status == open` |
| Delete | Admin | — |

### Notifications

| Action | Who |
|--------|-----|
| Read | Recipient (`recipientId == uid`) |
| Write | **Denied** — server-only via Cloud Functions Admin SDK |

Notifications are immutable from the client. The Admin SDK bypasses security rules when the `onTripStatusChange` function writes notification documents.

## Testing Rules Locally

1. Start emulators: `firebase emulators:start --only firestore,auth`
2. Use the Auth emulator to sign in test users with known UIDs.
3. Seed `users/{uid}` documents with appropriate `role` values.
4. Attempt reads/writes from a client SDK or the Emulator UI Rules playground.

## Design Notes

- **Fail closed**: unauthenticated requests are denied except where explicitly allowed.
- **Role elevation blocked**: users updating their own profile cannot change `role`.
- **Driver least privilege**: drivers see and mutate only their assigned trips, with limited status transitions.
- **Notification integrity**: client writes to `notifications` are fully blocked to prevent spoofing.
