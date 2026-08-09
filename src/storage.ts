import type { TripContent } from "./types";

// localStorage with an in-memory fallback (private browsing etc.).
// Keys are unchanged from the pre-React app so nobody loses local data:
//   tabi_content — offline copy of the trip
//   qn_<region>_<day> — per-device quick notes
//   fx_rate / fx_rate_ts — cached exchange rate

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
