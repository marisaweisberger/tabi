import type { TripContent } from "./types";

// localStorage with an in-memory fallback (private browsing etc.).
// Keys are unchanged from the pre-React app so nobody loses local data:
//   tabi_content — offline copy of the trip
//   fx_rate / fx_rate_ts — cached exchange rate
//   qn_<region>_<day> — LEGACY per-device quick notes; migrated into the
//     shared trip (day.q) on load, then removed
//   bk_* — LEGACY per-device booking checkmarks; same deal (booking.done)

const mem: Record<string, string> = {};

export const raw = {
  get(k: string): string | null {
    try {
      return localStorage.getItem(k);
    } catch {
      return mem[k] ?? null;
    }
  },
  set(k: string, v: string): void {
    try {
      localStorage.setItem(k, v);
    } catch {
      mem[k] = v;
    }
  },
  del(k: string): void {
    try {
      localStorage.removeItem(k);
    } catch {
      delete mem[k];
    }
  },
};

const CONTENT_KEY = "tabi_content";

export function getStoredContent(): TripContent | null {
  const s = raw.get(CONTENT_KEY);
  if (!s) return null;
  try {
    return JSON.parse(s) as TripContent;
  } catch {
    return null;
  }
}

export function setStoredContent(c: TripContent): void {
  raw.set(CONTENT_KEY, JSON.stringify(c));
}
