// The trip content API — GET returns the trip JSON, POST replaces it.
//
// The JSON lives in Netlify Blobs (free tier), not in this public repo and not
// in an env var (Lambda env vars cap out at 4 KB — too small for a real trip).
// The edge gate already blocks unauthenticated requests, but this function
// checks again so the data stays private even if the gate is misconfigured.

import { getStore } from "@netlify/blobs";

const COOKIE = "tabi_auth";
const STORE = "tabi";
const KEY = "trip";
const MAX_BYTES = 1_000_000;

async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getCookie(req: Request, name: string): string | null {
  for (const part of (req.headers.get("cookie") ?? "").split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === name) return part.slice(eq + 1);
  }
  return null;
}

async function authorized(req: Request): Promise<boolean> {
  const password = process.env.TRIP_PASSWORD ?? "";
  if (!password) return true; // no password configured yet — matches the edge gate
  if (req.headers.get("x-tabi-password") === password) return true;
  return getCookie(req, COOKIE) === (await sha256hex("tabi|" + password));
}

export default async (req: Request) => {
  if (!(await authorized(req))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const store = getStore(STORE);

  if (req.method === "GET") {
    const trip = await store.get(KEY, { type: "json" });
    if (!trip) return Response.json({ error: "no trip data yet" }, { status: 404 });
    return Response.json(trip, { headers: { "cache-control": "no-store" } });
  }

  if (req.method === "POST" || req.method === "PUT") {
    let trip: unknown;
    try {
      trip = await req.json();
    } catch {
      return Response.json({ error: "body must be JSON" }, { status: 400 });
    }
    if (!trip || typeof trip !== "object" || !Array.isArray((trip as any).regions)) {
      return Response.json({ error: 'trip data needs a "regions" array' }, { status: 400 });
    }
    if (JSON.stringify(trip).length > MAX_BYTES) {
      return Response.json({ error: "trip data too large" }, { status: 413 });
    }
    await store.setJSON(KEY, trip);
    return Response.json({ ok: true });
  }

  return Response.json({ error: "method not allowed" }, { status: 405 });
};

export const config = { path: "/api/trip-data" };
