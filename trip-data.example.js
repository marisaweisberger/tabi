// Copy this file to trip-data.js and fill in your own trip.
//
// trip-data.js is gitignored on purpose — it holds confirmation numbers,
// addresses, and the dates you're away, and this repo is public.
//
// These four arrays are only the *starting template* the app shows on a fresh
// device. Once you save anything, your real trip lives in the app's own storage
// (and in Firebase, if sync is on) — not in this file.

const REGIONS = [
  {
    name: "Tokyo",                                  // shown as the region heading
    dates: "Sep 13–17 · 4 nights",                  // small line under the heading
    transfer: false,                                // true = red dot on the rail
    days: [
      {
        d: "SEP 13 · SUN",                          // date label
        p: "Arrive, check in, dinner nearby.",      // the plan
        n: "Anything worth highlighting.",          // optional callout box
        transit: [
          { from: "Airport", to: "Central station", via: "Airport express", time: "~55 min", note: "Optional extra line" }
        ]
      }
    ]
  }
];

const BOOKINGS = [
  { id: "flights", t: "Flights", m: "Details, dates, links.", u: "" },
  { id: "hotel",   t: "Book a hotel", m: "Still to do.", u: "URGENT" }  // u: "URGENT" shows a red tag
];

const FOOD = [
  { r: "Tokyo", items: [
    { t: "Dish name", p: "Why it's worth seeking out, and where." }
  ]}
];

const STAYS = [
  { name: "Hotel name", dates: "Sep 13–17 · 4 nights", address: "Street, city", conf: "", notes: "Check-in time, deadlines. Blank conf = shows as NOT BOOKED." }
];
