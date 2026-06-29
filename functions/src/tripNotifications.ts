import * as admin from "firebase-admin";
import { Change, FirestoreEvent, QueryDocumentSnapshot } from "firebase-functions/v2/firestore";
import {
  Notification,
  Trip,
  TripStatus,
  buildTripStatusMessage,
  resolveNotificationRecipients,
} from "./types";

export const NOTIFICATIONS_COLLECTION = "notifications";

export interface TripStatusChangeInput {
  tripId: string;
  before: Trip | undefined;
  after: Trip | undefined;
}

export interface TripStatusChangeResult {
  created: number;
  skipped: boolean;
  reason?: string;
}

/**
 * Core logic invoked by the Cloud Function when a trip document changes.
 * Creates one notification per recipient when status changes.
 */
export async function handleTripStatusChange(
  db: FirebaseFirestore.Firestore,
  input: TripStatusChangeInput
): Promise<TripStatusChangeResult> {
  const { tripId, before, after } = input;

  if (!before || !after) {
    return { created: 0, skipped: true, reason: "missing_snapshot" };
  }

  const previousStatus = before.status;
  const newStatus = after.status;

  if (previousStatus === newStatus) {
    return { created: 0, skipped: true, reason: "status_unchanged" };
  }

  const recipients = resolveNotificationRecipients(after);
  if (recipients.length === 0) {
    return { created: 0, skipped: true, reason: "no_recipients" };
  }

  const message = buildTripStatusMessage(tripId, previousStatus, newStatus);
  const batch = db.batch();
  const now = admin.firestore.Timestamp.now();

  for (const recipientId of recipients) {
    const ref = db.collection(NOTIFICATIONS_COLLECTION).doc();
    const notification: Notification = {
      type: "trip_status_changed",
      recipientId,
      tripId,
      previousStatus,
      newStatus,
      message,
      read: false,
      createdAt: now,
    };
    batch.set(ref, notification);
  }

  await batch.commit();
  return { created: recipients.length, skipped: false };
}

export async function processTripStatusChangeEvent(
  db: FirebaseFirestore.Firestore,
  event: FirestoreEvent<Change<QueryDocumentSnapshot> | undefined, { tripId: string }>
): Promise<TripStatusChangeResult> {
  const tripId = event.params.tripId;
  const before = event.data?.before.data() as Trip | undefined;
  const after = event.data?.after.data() as Trip | undefined;

  return handleTripStatusChange(db, { tripId, before, after });
}

export function tripStatusChanged(previous: TripStatus, next: TripStatus): boolean {
  return previous !== next;
}
