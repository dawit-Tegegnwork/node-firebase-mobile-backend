/** Shared domain types for the synthetic transport backend. */

export type UserRole = "admin" | "dispatcher" | "driver";

export type TripStatus =
  | "requested"
  | "assigned"
  | "en_route"
  | "completed"
  | "cancelled";

export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type NotificationType = "trip_status_changed";

export interface UserProfile {
  displayName: string;
  email: string;
  role: UserRole;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface Trip {
  origin: string;
  destination: string;
  status: TripStatus;
  createdBy: string;
  driverId?: string;
  passengerName?: string;
  notes?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface SupportTicket {
  subject: string;
  body: string;
  status: SupportTicketStatus;
  createdBy: string;
  assignedTo?: string;
  tripId?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface Notification {
  type: NotificationType;
  recipientId: string;
  tripId: string;
  previousStatus: TripStatus;
  newStatus: TripStatus;
  message: string;
  read: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  requested: "Requested",
  assigned: "Assigned",
  en_route: "En Route",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const VALID_TRIP_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  requested: ["assigned", "cancelled"],
  assigned: ["en_route", "cancelled"],
  en_route: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function isValidTripTransition(
  from: TripStatus,
  to: TripStatus
): boolean {
  return VALID_TRIP_TRANSITIONS[from].includes(to);
}

export function buildTripStatusMessage(
  tripId: string,
  previousStatus: TripStatus,
  newStatus: TripStatus
): string {
  return `Trip ${tripId} moved from ${TRIP_STATUS_LABELS[previousStatus]} to ${TRIP_STATUS_LABELS[newStatus]}.`;
}

export function resolveNotificationRecipients(trip: Trip): string[] {
  const recipients = new Set<string>();
  if (trip.createdBy) {
    recipients.add(trip.createdBy);
  }
  if (trip.driverId) {
    recipients.add(trip.driverId);
  }
  return [...recipients];
}
