// The shape of the trip JSON stored on the server (/api/trip-data) and in
// localStorage. Keep in sync with trip-data.example.json — and remember the
// real data never goes in this repo.

export interface TransitLeg {
  from: string;
  to: string;
  via?: string;
  time?: string;
  note?: string;
}

export interface Day {
  /** Date label, e.g. "SEP 21 · MON" */
  d: string;
  /** The plan for the day */
  p: string;
  /** Optional highlighted note */
  n?: string;
  /** Quick note — free-form, synced to everyone like the rest of the trip */
  q?: string;
  transit?: TransitLeg[];
}

export interface Region {
  name: string;
  /** Dates line, e.g. "Sep 13–17 · 4 nights" */
  dates: string;
  /** Transfer stop — shows a red dot on the rail */
  transfer?: boolean;
  days?: Day[];
}

export interface Booking {
  id: string;
  /** Title */
  t: string;
  /** Details */
  m: string;
  /** Urgency label ("URGENT" or "") */
  u?: string;
  done?: boolean;
}

export interface Dish {
  /** Dish name */
  t: string;
  /** Why / where */
  p: string;
}

export interface FoodRegion {
  /** Region name */
  r: string;
  items?: Dish[];
}

export interface Stay {
  name: string;
  dates?: string;
  address?: string;
  /** Confirmation number — blank means NOT BOOKED */
  conf?: string;
  notes?: string;
}

export interface TripContent {
  title?: string;
  /** ISO date, e.g. "2026-09-13" */
  departDate?: string;
  regions: Region[];
  bookings?: Booking[];
  food?: FoodRegion[];
  stays?: Stay[];
  /** Stamped on every save; the newest copy wins between phones and server */
  _updatedAt?: number;
}

export function isTripContent(c: unknown): c is TripContent {
  return !!c && typeof c === "object" && Array.isArray((c as TripContent).regions);
}
