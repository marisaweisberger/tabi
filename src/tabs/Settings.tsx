import { useEffect, useRef, useState } from "react";
import { isTripContent, type TripContent } from "../types";
import type { ServerStatus } from "../useTrip";

// The whole trip as one auto-saving JSON editor. Stop typing for a moment and
// valid JSON is adopted and synced; invalid JSON shows what's wrong and
// nothing is touched. No save button, on purpose.

interface Props {
  content: TripContent;
  save: (next: TripContent) => void;
  status: ServerStatus;
}

export default function Settings({ content, save, status }: Props) {
  const [text, setText] = useState(() => JSON.stringify(content, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const focused = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Keep the editor in sync with saves made elsewhere (other tabs, other
  // phones) — but never overwrite while someone is typing in it.
  useEffect(() => {
    if (!focused.current) {
      setText(JSON.stringify(content, null, 2));
      setJsonError(null);
    }
  }, [content]);

  const onChange = (v: string) => {
    setText(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(v);
      } catch (e) {
        setJsonError("Not valid JSON yet — nothing saved. (" + (e as Error).message + ")");
        return;
      }
      if (!isTripContent(parsed)) {
        setJsonError('Trip data needs at least a "regions" array — nothing saved.');
        return;
      }
      setJsonError(null);
      save(parsed);
    }, 1200);
  };

  const shown = jsonError ?? status.msg;
  const cls = jsonError ? "err" : status.ok === undefined ? "" : status.ok ? "ok" : "err";

  return (
    <div className="set-card">
      <h3>Trip data</h3>
      <p>
        The whole trip as JSON, kept on the site's server behind the trip password. Edit it here — or paste a whole
        new version — and it saves and syncs to every phone by itself. Tip: paste this to Claude, describe the change,
        paste the result back.
      </p>
      <textarea
        style={{ minHeight: 260 }}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => (focused.current = true)}
        onBlur={() => (focused.current = false)}
      />
      <div id="srvstatus" className={cls}>{shown}</div>
    </div>
  );
}
