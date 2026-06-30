/**
 * Seed Firebase emulator with synthetic transport demo data.
 * Run with: FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 npx ts-node scripts/seed-emulator.ts
 */
import * as admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID || "demo-transport";

if (!admin.apps.length) {
  admin.initializeApp({ projectId });
}

const db = admin.firestore();

async function seed() {
  const trips = db.collection("trips");
  const existing = await trips.limit(1).get();
  if (!existing.empty) {
    console.log("Demo data already present — skipping seed.");
    return;
  }

  await trips.doc("trip-demo-001").set({
    passengerId: "passenger-demo-1",
    driverId: "driver-demo-1",
    dispatcherId: "dispatcher-demo-1",
    status: "scheduled",
    pickup: "Synthetic Station A",
    dropoff: "Synthetic Station B",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await trips.doc("trip-demo-002").set({
    passengerId: "passenger-demo-2",
    driverId: "driver-demo-1",
    dispatcherId: "dispatcher-demo-1",
    status: "en_route",
    pickup: "Synthetic Depot",
    dropoff: "Synthetic Campus",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await db.collection("supportTickets").doc("ticket-demo-001").set({
    subject: "Synthetic delay notification",
    status: "open",
    priority: "medium",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log("Seeded demo trips and support ticket.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
