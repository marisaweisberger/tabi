import { useState } from "react";
import type { Day, Region, TransitLeg, TripContent } from "../types";
import { raw } from "../storage";

// Regions on the train-rail timeline, each with editable days.
// Trip edits go through save() and sync to everyone; quick notes on days are
// personal and stay on this device (localStorage, key qn_<region>_<day>).

interface Props {
  content: TripContent;
  save: (next: TripContent) => void;
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

function QuickNote(props: { storageKey: string }) {
  const [text, setText] = useState(() => raw.get(props.storageKey) || "");
  return (
    <details className={"qnote" + (text.trim() ? " has" : "")}>
      <summary>quick note</summary>
      <textarea
        value={text}
        placeholder="On-the-ground notes"
        onChange={(e) => {
          setText(e.target.value);
          raw.set(props.storageKey, e.target.value);
        }}
      />
    </details>
  );
}

export default function Itinerary({ content, save }: Props) {
  // null = default (first region open); afterwards open regions are tracked by name.
  const [open, setOpen] = useState<Set<string> | null>(null);
  const [editing, setEditing] = useState<Editing>(null);

  const regions = content.regions || [];
  const isOpen = (r: Region, ri: number) => (open ? open.has(r.name) : ri === 0);

  const toggle = (r: Region) => {
    const next = new Set(open ?? regions.filter((x, i) => isOpen(x, i)).map((x) => x.name));
    if (next.has(r.name)) next.delete(r.name);
    else next.add(r.name);
    setOpen(next);
  };

  const saveRegions = (next: Region[]) => {
    setEditing(null);
    save({ ...content, regions: next });
  };

  const updateRegion = (ri: number, r: Region) => saveRegions(regions.map((x, i) => (i === ri ? r : x)));

  const saveDay = (ri: number, di: number, day: Day, isNew: boolean) => {
    const r = regions[ri];
    const days = [...(r.days || [])];
    if (isNew) days.push(day);
    else days[di] = day;
    updateRegion(ri, { ...r, days });
  };

  const deleteDay = (ri: number, di: number) => {
    if (!confirm("Delete this day for everyone on the trip?")) return;
    const r = regions[ri];
    updateRegion(ri, { ...r, days: (r.days || []).filter((_, i) => i !== di) });
  };

  const deleteRegion = (ri: number) => {
    if (!confirm(`Delete the whole "${regions[ri].name}" region and its days for everyone?`)) return;
    saveRegions(regions.filter((_, i) => i !== ri));
  };

  const addRegion = () => {
    save({ ...content, regions: [...regions, { name: "New region", dates: "", transfer: false, days: [] }] });
    setEditing("region_" + regions.length);
  };

  return (
    <div className="rail">
      {regions.map((r, ri) => (
        <div key={ri} className={"station" + (r.transfer ? " transfer" : "") + (isOpen(r, ri) ? " open" : "")}>
          <button className="region-head" aria-expanded={isOpen(r, ri)} onClick={() => toggle(r)}>
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
              editing === ri + "_" + di ? (
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
                  <QuickNote storageKey={`qn_${ri}_${di}`} />
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
            <button className="addday" onClick={() => setEditing("newday_" + ri)}>
              + Add a day to {r.name}
            </button>
          </div>
        </div>
      ))}
      <button className="addday" onClick={addRegion}>
        + Add a region (a new city or leg)
      </button>
    </div>
  );
}
