# Data Model

Synthetic transport domain for a mobile dispatch app. All timestamps are Firestore `Timestamp` values.

## Collections

### `users/{userId}`

User profiles linked to Firebase Auth UIDs.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `displayName` | string | yes | Display name |
| `email` | string | yes | Email address |
| `role` | string | yes | One of: `admin`, `dispatcher`, `driver` |
| `createdAt` | timestamp | yes | Profile creation time |
| `updatedAt` | timestamp | yes | Last profile update |

**Roles**

| Role | Typical use |
|------|-------------|
| `admin` | Platform administration, user provisioning |
| `dispatcher` | Trip creation, assignment, ticket handling |
| `driver` | Execute assigned trips, limited ticket updates |

---

### `trips/{tripId}`

Transport jobs between two synthetic locations.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `origin` | string | yes | Pickup location label |
| `destination` | string | yes | Dropoff location label |
| `status` | string | yes | Trip lifecycle status (see below) |
| `createdBy` | string | yes | UID of creating dispatcher/admin |
| `driverId` | string | no | Assigned driver UID |
| `passengerName` | string | no | Optional passenger label |
| `notes` | string | no | Dispatcher notes |
| `createdAt` | timestamp | yes | Creation time |
| `updatedAt` | timestamp | yes | Last status/metadata update |

**Trip status flow**

```
requested → assigned → en_route → completed
     ↓          ↓           ↓
 cancelled  cancelled   cancelled
```

| Status | Meaning |
|--------|---------|
| `requested` | New trip, awaiting assignment |
| `assigned` | Driver assigned, not yet departed |
| `en_route` | Driver en route or in progress |
| `completed` | Trip finished successfully |
| `cancelled` | Trip cancelled at any stage |

Valid transitions are enforced in application logic (`VALID_TRIP_TRANSITIONS` in `functions/src/types.ts`). Security rules allow staff full updates; drivers may only move their own trips to `en_route` or `completed`.

---

### `supportTickets/{ticketId}`

Help requests from drivers or dispatchers.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | string | yes | Short summary |
| `body` | string | yes | Detailed description |
| `status` | string | yes | `open`, `in_progress`, `resolved`, `closed` |
| `createdBy` | string | yes | Creator UID |
| `assignedTo` | string | no | Staff member handling ticket |
| `tripId` | string | no | Related trip reference |
| `createdAt` | timestamp | yes | Creation time |
| `updatedAt` | timestamp | yes | Last update |

New tickets must start with `status: open`. Staff (`admin`, `dispatcher`) can update any field; creators may edit `body` only while status is `open`.

---

### `notifications/{notificationId}`

System-generated alerts. **Clients cannot write** — only Cloud Functions create these records.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | Currently: `trip_status_changed` |
| `recipientId` | string | yes | Target user UID |
| `tripId` | string | yes | Related trip |
| `previousStatus` | string | yes | Status before change |
| `newStatus` | string | yes | Status after change |
| `message` | string | yes | Human-readable summary |
| `read` | boolean | yes | Read flag (default `false`) |
| `createdAt` | timestamp | yes | Creation time |

Recipients are derived from `trip.createdBy` and `trip.driverId` when present.

---

## Indexes

Composite indexes (see `firestore.indexes.json`):

- `trips`: `driverId` + `status` + `updatedAt` (desc)
- `supportTickets`: `createdBy` + `status` + `createdAt` (desc)

## Entity Relationships

```
users ──creates──► trips ◄──assigned── users (driver)
  │                  │
  │                  └── triggers ──► notifications
  │
  └──creates──► supportTickets ──optional──► trips
```
