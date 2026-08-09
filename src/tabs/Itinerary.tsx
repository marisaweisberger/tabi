import { useEffect, useRef, useState } from "react";
import type { Day, Region, TransitLeg } from "../types";
import type { SaveFn } from "../useTrip";

// Regions on the train-rail timeline, each with editable days.
// Everything — including each day's quick note — goes through save() and
// syncs to every phone.

interface Props {
  regions: Region[];
  save: SaveFn;
  /** Bumps when a newer copy arrives from the server — discard open edits. */
  syncNonce: number;
}

function legsToText(t: TransitLeg[] | undefined): string {
  return (t || [])
    .map((l) =>
      [l.from + " -> " + l.to, l.via || "", l.time || "", l.note || ""].join(" | ").replace(/( \| )+$/, ""),
    )
    .join("\n");
}

function textToLegs(txt: string): TransitLeg[] {
  return txt
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      const route = (parts[0] || "").split(/->|→/).map((p) => p.trim());
      const leg: TransitLeg = { from: route[0] || "", to: route[1] || "", via: parts[1] || "", time: parts[2] || "" };
      if (parts[3]) leg.note = parts[3];
      return leg;
    });
}

/** "ri_di" = editing a day, "newday_ri" = adding one, "region_ri" = region header */
type Editing = string | null;

function DayEditor(props: { day: Day; isNew: boolean; onSave: (d: Day) => void; onCancel: () => void; onDelete?: () => void }) {
  const [d, setD] = useState(props.day.d || "");
  const [p, setP] = useState(props.day.p || "");
  const [n, setN] = useState(props.day.n || "");
  const [legs, setLegs] = useState(legsToText(props.day.transit));

  const commit = () => {
    const day: Day = { ...props.day, d: d.trim(), p: p.trim() };
    const note = n.trim();
    if (note) day.n = note;
    else delete day.n;
    const t = textToLegs(legs);
    if (t.length) day.transit = t;
    else delete day.transit;
    props.onSave(day);
  };

  return (
    <div className="dayedit">
      <label>date label</label>
      <input value={d} onChange={(e) => setD(e.target.value)} placeholder="SEP 21 · MON" />
      <label>plan</label>
      <textarea value={p} onChange={(e) => setP(e.target.value)} />
      <label>highlighted note (optional)</label>
      <textarea value={n} onChange={(e) => setN(e.target.value)} />
      <label>transit — one leg per line: From -&gt; To | line | time | note</label>
      <textarea className="tlegs" value={legs} onChange={(e) => setLegs(e.target.value)} />
      <div className="row">
        <button className="btn sm" onClick={commit}>Save</button>
        <button className="btn sm ghost" onClick={props.onCancel}>Cancel</button>
        {!props.isNew && props.onDelete && (
          <button className="btn sm danger" onClick={props.onDelete}>Delete day</button>
        )}
      </div>
    </div>
  );
}

function RegionEditor(props: { region: Region; onSave: (r: Region) => void; onCancel: () => void; onDelete: () => void }) {
  const [name, setName] = useState(props.region.name || "");
  const [dates, setDates] = useState(props.region.dates || "");
  const [transfer, setTransfer] = useState(!!props.region.transfer);

  return (
    <div className="regionedit">
      <label>region name</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      <label>dates line</label>
      <input type="text" value={dates} onChange={(e) => setDates(e.target.value)} />
      <label className="chk">
        <input type="checkbox" checked={transfer} onChange={(e) => setTransfer(e.target.checked)} /> Transfer stop (red dot)
      </label>
      <div className="row">
        <button
          className="btn sm"
          onClick={() => props.onSave({ ...props.region, name: name.trim() || "Untitled", dates: dates.trim(), transfer })}
        >
          Save
        </button>
        <button className="btn sm ghost" onClick={props.onCancel}>Cancel</button>
        <button className="btn sm danger" onClick={props.onDelete}>Delete region</button>
      </div>
    </div>
  );
}

// A day's free-form note. Auto-saves (debounced, flushed on blur) into the
// shared trip, so it syncs to every phone. While the box is focused it shows
// what's being typed; otherwise it follows the synced value.
function QuickNote(props: { value: string; onSave: (v: string) => void }) {
  const [text, setText] = useState(props.value);
  const [isFocused, setIsFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isFocused) setText(props.value);
  }, [props.value, isFocused]);

  return (
    <details className={"qnote" + (text.trim() ? " has" : "")}>
      <summary>quick note</summary>
      <textarea
        value={text}
        placeholder="On-the-ground notes — synced to everyone"
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          clearTimeout(timer.current);
          if (text !== props.value) props.onSave(text);
        }}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => props.onSave(v), 800);
        }}
      />
    </details>
  );
}

export default function Itinerary({ regions, save, syncNonce }: Props) {
  // null = default (first region open); afterwards open regions are tracked by name.
  const [open, setOpen] = useState<Set<string> | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [query, setQuery] = useState("");

  // A newer copy from the server may have reordered or removed things, so an
  // open editor could save over the wrong day/region — close it instead.
  useEffect(() => setEditing(null), [syncNonce]);

  // While searching, every region with a hit is forced open so results are visible.
  const q = query.trim().toLowerCase();
  const has = (s?: string) => !!s && s.toLowerCase().includes(q);
  const dayMatches = (d: Day) =>
    has(d.d) ||
    has(d.p) ||
    has(d.n) ||
    has(d.q) ||
    (d.transit || []).some((l) => has(l.from) || has(l.to) || has(l.via) || has(l.time) || has(l.note));

  const isOpen = (r: Region, ri: number) => (open ? open.has(r.name) : ri === 0);

  const toggle = (r: Region) => {
    const next = new Set(open ?? regions.filter((x, i) => isOpen(x, i)).map((x) => x.name));
    if (next.has(r.name)) next.delete(r.name);
    else next.add(r.name);
    setOpen(next);
  };

  const saveRegions = (update: (cur: Region[]) => Region[]) => {
    setEditing(null);
    save((c) => ({ ...c, regions: update(c.regions || []) }));
  };

  const updateRegion = (ri: number, r: Region) => saveRegions((cur) => cur.map((x, i) => (i === ri ? r : x)));

  const saveDay = (ri: number, di: number, day: Day, isNew: boolean) =>
    saveRegions((cur) =>
      cur.map((r, i) => {
        if (i !== ri) return r;
        const days = [...(r.days || [])];
        if (isNew) days.push(day);
        else days[di] = day;
        return { ...r, days };
      }),
    );

  const deleteDay = (ri: number, di: number) => {
    if (!confirm("Delete this day for everyone on the trip?")) return;
    saveRegions((cur) => cur.map((r, i) => (i === ri ? { ...r, days: (r.days || []).filter((_, x) => x !== di) } : r)));
  };

  // Write a day's quick note in place — no editor involved, so no setEditing.
  const saveQuickNote = (ri: number, di: number, v: string) =>
    save((c) => ({
      ...c,
      regions: (c.regions || []).map((r, i) => {
        if (i !== ri) return r;
        return {
          ...r,
          days: (r.days || []).map((d, x) => {
            if (x !== di) return d;
            const next = { ...d };
            if (v.trim()) next.q = v;
            else delete next.q;
            return next;
          }),
        };
      }),
    }));

  const deleteRegion = (ri: number) => {
    if (!confirm(`Delete the whole "${regions[ri].name}" region and its days for everyone?`)) return;
    saveRegions((cur) => cur.filter((_, i) => i !== ri));
  };

  const addRegion = () => {
    save((c) => ({ ...c, regions: [...(c.regions || []), { name: "New region", dates: "", transfer: false, days: [] }] }));
    setEditing("region_" + regions.length);
  };

  // With a search on: a region whose name/dates match shows all its days;
  // otherwise it shows only matching days, and disappears if it has none.
  const shown = regions.map((r, ri) => {
    if (!q) return { r, ri, headMatch: true, days: null as boolean[] | null };
    const headMatch = has(r.name) || has(r.dates);
    const days = (r.days || []).map(dayMatches);
    return { r, ri, headMatch, days };
  }).filter((x) => x.headMatch || (x.days && x.days.some(Boolean)));

  return (
    <>
      <div className="searchbar">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the itinerary — places, plans, notes…"
          aria-label="Search the itinerary"
          enterKeyHint="search"
        />
        {query && (
          <button className="clear" aria-label="Clear search" onClick={() => setQuery("")}>
            ✕
          </button>
        )}
      </div>
      {q && shown.length === 0 && <div className="search-empty">No matches for “{query.trim()}”</div>}
    <div className="rail">
      {shown.map(({ r, ri, headMatch, days: dayHits }) => (
        <div key={ri} className={"station" + (r.transfer ? " transfer" : "") + (q || isOpen(r, ri) ? " open" : "")}>
          <button className="region-head" aria-expanded={!!q || isOpen(r, ri)} onClick={() => toggle(r)}>
            <div>
              <h2>{r.name}</h2>
              <span className="dates">{r.dates}</span>
            </div>
            <span className="region-tools">
              <span
                className="editbtn"
                style={{ position: "static" }}
                role="button"
                aria-label="Edit region"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing("region_" + ri);
                }}
              >
                ✎
              </span>
              <span className="chev">▸</span>
            </span>
          </button>
          <div className="region-body">
            {editing === "region_" + ri && (
              <RegionEditor
                region={r}
                onSave={(next) => updateRegion(ri, next)}
                onCancel={() => setEditing(null)}
                onDelete={() => deleteRegion(ri)}
              />
            )}
            {(r.days || []).map((d, di) =>
              q && !headMatch && dayHits && !dayHits[di] ? null : editing === ri + "_" + di ? (
                <div key={di} className="day">
                  <DayEditor
                    day={d}
                    isNew={false}
                    onSave={(day) => saveDay(ri, di, day, false)}
                    onCancel={() => setEditing(null)}
                    onDelete={() => deleteDay(ri, di)}
                  />
                </div>
              ) : (
                <div key={di} className="day">
                  <button className="editbtn" aria-label="Edit this day" onClick={() => setEditing(ri + "_" + di)}>
                    ✎
                  </button>
                  <div className="d">{d.d}</div>
                  <p>{d.p}</p>
                  {d.n && <div className="note">{d.n}</div>}
                  {d.transit && d.transit.length > 0 && (
                    <div className="transit">
                      {d.transit.map((l, li) => (
                        <div key={li} className="leg">
                          <span className="dot" />
                          <div className="route">
                            {l.from}
                            <span className="arr">→</span>
                            {l.to}
                          </div>
                          <div className="via">
                            <b>{l.via}</b> · {l.time}
                          </div>
                          {l.note && <div className="lnote">{l.note}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  <QuickNote value={d.q || ""} onSave={(v) => saveQuickNote(ri, di, v)} />
                </div>
              ),
            )}
            {editing === "newday_" + ri && (
              <div className="day">
                <DayEditor
                  day={{ d: "", p: "" }}
                  isNew
                  onSave={(day) => saveDay(ri, (r.days || []).length, day, true)}
                  onCancel={() => setEditing(null)}
                />
              </div>
            )}
            {!q && (
              <button className="addday" onClick={() => setEditing("newday_" + ri)}>
                + Add a day to {r.name}
              </button>
            )}
          </div>
        </div>
      ))}
      {!q && (
        <button className="addday" onClick={addRegion}>
          + Add a region (a new city or leg)
        </button>
      )}
    </div>
    </>
  );
}
