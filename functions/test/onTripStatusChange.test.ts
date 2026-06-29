import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import {
  handleTripStatusChange,
  NOTIFICATIONS_COLLECTION,
} from "../src/tripNotifications";
import { Trip } from "../src/types";

const PROJECT_ID = "demo-transport";

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  const now = Timestamp.now();
  return {
    origin: "North Depot",
    destination: "Central Plaza",
    status: "requested",
    createdBy: "dispatcher-1",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("handleTripStatusChange (Firestore emulator)", () => {
  let db: FirebaseFirestore.Firestore;

  before(() => {
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8085";
    }
    process.env.GCLOUD_PROJECT = PROJECT_ID;

    if (admin.apps.length === 0) {
      admin.initializeApp({ projectId: PROJECT_ID });
    }
    db = admin.firestore();
  });

  beforeEach(async () => {
    const collections = ["trips", NOTIFICATIONS_COLLECTION];
    for (const name of collections) {
      const snapshot = await db.collection(name).get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      if (!snapshot.empty) {
        await batch.commit();
      }
    }
  });

  after(async () => {
    await admin.app().delete();
  });

  it("creates notification records when trip status changes", async () => {
    const tripId = "trip-emulator-1";
    const before = makeTrip({ status: "requested", driverId: "driver-1" });
    const after = makeTrip({
      status: "assigned",
      driverId: "driver-1",
      createdBy: "dispatcher-1",
    });

    const result = await handleTripStatusChange(db, {
      tripId,
      before,
      after,
    });

    assert.equal(result.skipped, false);
    assert.equal(result.created, 2);

    const notifications = await db.collection(NOTIFICATIONS_COLLECTION).get();
    assert.equal(notifications.size, 2);

    const recipientIds = notifications.docs.map(
      (doc) => doc.data().recipientId as string
    );
    assert.ok(recipientIds.includes("dispatcher-1"));
    assert.ok(recipientIds.includes("driver-1"));

    const first = notifications.docs[0].data();
    assert.equal(first.type, "trip_status_changed");
    assert.equal(first.tripId, tripId);
    assert.equal(first.previousStatus, "requested");
    assert.equal(first.newStatus, "assigned");
    assert.equal(first.read, false);
    assert.match(first.message, /Requested.*Assigned/);
  });

  it("skips when status is unchanged", async () => {
    const trip = makeTrip({ status: "en_route", driverId: "driver-1" });

    const result = await handleTripStatusChange(db, {
      tripId: "trip-emulator-2",
      before: trip,
      after: { ...trip },
    });

    assert.equal(result.skipped, true);
    assert.equal(result.reason, "status_unchanged");

    const notifications = await db.collection(NOTIFICATIONS_COLLECTION).get();
    assert.equal(notifications.size, 0);
  });

  it("persists notifications readable via Firestore emulator", async () => {
    const tripId = "trip-emulator-3";
    await db.collection("trips").doc(tripId).set(
      makeTrip({ status: "assigned", driverId: "driver-2" })
    );

    await handleTripStatusChange(db, {
      tripId,
      before: makeTrip({ status: "assigned", driverId: "driver-2" }),
      after: makeTrip({ status: "en_route", driverId: "driver-2" }),
    });

    const snapshot = await db
      .collection(NOTIFICATIONS_COLLECTION)
      .where("tripId", "==", tripId)
      .get();

    assert.equal(snapshot.size, 2);
    snapshot.docs.forEach((doc) => {
      assert.equal(doc.data().newStatus, "en_route");
    });
  });
});
