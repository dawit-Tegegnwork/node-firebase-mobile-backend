import * as admin from "firebase-admin";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { processTripStatusChangeEvent } from "./tripNotifications";

admin.initializeApp();

export const onTripStatusChange = onDocumentUpdated(
  {
    document: "trips/{tripId}",
    region: "us-central1",
  },
  async (event) => {
    const db = admin.firestore();
    const result = await processTripStatusChangeEvent(db, event);

    if (!result.skipped) {
      console.log(
        `Created ${result.created} notification(s) for trip ${event.params.tripId}`
      );
    }

    return result;
  }
);
