import { useEffect, useRef, useState } from "react";
import { isTripContent, type TripContent } from "../types";
import type { SaveFn, ServerStatus } from "../useTrip";

// The whole trip as one auto-saving JSON editor. Stop typing for a moment and
// valid JSON is adopted and synced; invalid JSON shows what's wrong and
// nothing is touched. No save button, on purpose.

interface Props {
  content: TripContent;
  save: SaveFn;
  status: ServerStatus;
}

export default function Settings({ content, save, status }: Props) {
  const [text, setText] = useState(() => JSON.stringify(content, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [copied, setCopied] = useState(false);
  const focused = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const areaRef = useRef<HTMLTextAreaElement>(null);

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
      save(() => parsed);
    }, 1200);
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers: select everything in the textarea and use the legacy
      // copy command instead.
      const ta = areaRef.current;
      if (!ta) return;
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      document.execCommand("copy");
      ta.blur();
    }
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  // While someone is typing, only their own feedback (errors, "Saved…")
  // belongs here — background sync chatter would be misleading mid-edit.
  const showStatus = !isFocused || status.msg.startsWith("Saved");
  const shown = jsonError ?? (showStatus ? status.msg : "");
  const cls = jsonError ? "err" : status.ok === undefined ? "" : status.ok ? "ok" : "err";

  return (
    <div className="set-card">
      <h3>Trip data</h3>
      <p>
        The whole trip as JSON, kept on the site's server behind the trip password. Edit it here — or paste a whole
        new version — and it saves and syncs to every phone by itself. Tip: paste this to Claude, describe the change,
        paste the result back.
      </p>
      <button className="btn sm" style={{ marginTop: 0, marginBottom: 10 }} onClick={copyAll}>
        {copied ? "Copied ✓" : "Copy it all"}
      </button>
      <textarea
        ref={areaRef}
        style={{ minHeight: 260 }}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          focused.current = true;
          setIsFocused(true);
        }}
        onBlur={() => {
          focused.current = false;
          setIsFocused(false);
        }}
      />
      <div id="srvstatus" className={cls}>{shown}</div>
    </div>
  );
}
