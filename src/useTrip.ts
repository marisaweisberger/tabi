import { useCallback, useEffect, useRef, useState } from "react";
import type { TripContent } from "./types";
import { getStoredContent, setStoredContent, raw } from "./storage";

// One hook owns the trip content and how it moves around:
//  - localStorage keeps an offline copy on every phone (key tabi_content)
//  - the server (/api/trip-data, Netlify Blobs) is the shared source of truth
//  - every save stamps _updatedAt; the newest copy wins when they disagree
//  - saves auto-push (debounced); opening/focusing the app pulls the latest
// There are deliberately no save/load/sync buttons anywhere.

const SERVER_URL = "/api/trip-data";

const TEMPLATE: TripContent = {
  title: "Japan 2026",
  departDate: "2026-09-13",
  regions: [],
  bookings: [],
  food: [],
  stays: [],
};

export type ServerState = "checking" | "on" | "off";

export interface ServerStatus {
  msg: string;
  ok?: boolean;
}

/** Tabs save with an updater on the CURRENT trip, never a stale snapshot. */
export type SaveFn = (update: (cur: TripContent) => TripContent) => void;

export function useTrip() {
  const [content, setContent] = useState<TripContent | null>(null);
  const [templateMode, setTemplateMode] = useState(false);
  const [serverState, setServerState] = useState<ServerState>("checking");
  const [status, setStatus] = useState<ServerStatus>({ msg: "" });
  // Bumped whenever a newer copy is adopted from the server, so tabs can
  // discard in-progress edits that might otherwise target shifted items.
  const [syncNonce, setSyncNonce] = useState(0);

  // Refs mirror state for use inside debounced/async callbacks.
  const contentRef = useRef<TripContent | null>(null);
  const templateModeRef = useRef(false);
  const serverStateRef = useRef<ServerState>("checking");
  const pushTimer = useRef<ReturnType<typeof setTimeout>>();
  const syncing = useRef(false);

  const markServer = useCallback((s: ServerState) => {
    serverStateRef.current = s;
    setServerState(s);
  }, []);

  const pushToServer = useCallback(() => {
    clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(SERVER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contentRef.current),
        });
        if (r.ok) {
          markServer("on");
          setStatus({ msg: "Saved to server · " + new Date().toLocaleTimeString(), ok: true });
        } else if (r.status === 401) {
          setStatus({
            msg: "Password session expired — reload the app and enter the trip password. Changes are safe on this phone.",
            ok: false,
          });
        } else {
          setStatus({ msg: `Server save failed (${r.status}) — changes are safe on this phone.`, ok: false });
        }
      } catch {
        setStatus({ msg: "Offline — changes saved on this phone; they'll sync when you're back online.", ok: false });
      }
    }, 800);
  }, [markServer]);

  /** The one way to change the trip. Stamps, stores locally, and syncs. */
  const save = useCallback<SaveFn>(
    (update) => {
      if (!contentRef.current) return;
      const stamped = { ...update(contentRef.current), _updatedAt: Date.now() };
      templateModeRef.current = false;
      setTemplateMode(false);
      contentRef.current = stamped;
      setContent(stamped);
      setStoredContent(stamped);
      if (serverStateRef.current !== "off") pushToServer();
    },
    [pushToServer],
  );

  const adopt = useCallback((server: TripContent) => {
    setStoredContent(server);
    contentRef.current = server;
    setContent(server);
    templateModeRef.current = false;
    setTemplateMode(false);
    setSyncNonce((n) => n + 1);
  }, []);

  /** Pull the latest from the server; newest _updatedAt wins. */
  const syncFromServer = useCallback(async () => {
    if (syncing.current) return;
    syncing.current = true;
    try {
      const r = await fetch(SERVER_URL, { headers: { Accept: "application/json" } });
      const isJson = (r.headers.get("content-type") || "").includes("json");
      if (r.status === 404 && isJson) {
        // Server storage works; nothing saved there yet.
        markServer("on");
        if (!templateModeRef.current) pushToServer();
        else setStatus({ msg: "Connected — nothing on the server yet. Save a trip and it'll live there.", ok: true });
        return;
      }
      if (!r.ok || !isJson) throw new Error("HTTP " + r.status);
      const server = (await r.json()) as TripContent;
      markServer("on");
      const localTs = contentRef.current?._updatedAt ?? 0;
      const serverTs = server._updatedAt ?? 0;
      if (templateModeRef.current || serverTs > localTs) adopt(server);
      else if (localTs > serverTs) pushToServer();
      setStatus({ msg: "Connected — trip data lives on the server.", ok: true });
    } catch {
      markServer("off");
      setStatus({ msg: "Server not reachable (offline?) — using this phone's copy for now.", ok: false });
    } finally {
      syncing.current = false;
    }
  }, [adopt, markServer, pushToServer]);

  // Boot: local copy (or the built-in template), then ask the server.
  useEffect(() => {
    const stored = getStoredContent();
    if (stored) {
      // One-time migration from the pre-sync era: checkmarks used to live
      // per-device under bk_* keys; now they're part of the shared trip.
      let migrated = false;
      for (const b of stored.bookings ?? []) {
        if (b.done === undefined && raw.get("bk_" + b.id) === "1") {
          b.done = true;
          migrated = true;
        }
      }
      contentRef.current = stored;
      setContent(stored);
      if (migrated) save((c) => c);
    } else {
      const t = structuredClone(TEMPLATE);
      contentRef.current = t;
      setContent(t);
      templateModeRef.current = true;
      setTemplateMode(true);
    }
    void syncFromServer();

    // Pull the latest whenever the app comes back into view.
    const onVisible = () => {
      if (document.visibilityState === "visible") void syncFromServer();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { content, templateMode, serverState, status, save, syncFromServer, syncNonce };
}
