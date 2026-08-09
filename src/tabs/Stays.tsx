import { useEffect, useState } from "react";
import type { Stay } from "../types";
import type { SaveFn } from "../useTrip";

// Hotels and ryokan. A blank confirmation number shows as NOT BOOKED (dashed).

interface Props {
  stays: Stay[];
  save: SaveFn;
  /** Bumps when a newer copy arrives from the server — discard open edits. */
  syncNonce: number;
}

function StayEditor(props: { stay: Stay; onSave: (s: Stay) => void; onCancel: () => void }) {
  const [s, setS] = useState<Stay>({ ...props.stay });
  const field = (label: string, key: keyof Stay) => (
    <>
      <label>{label}</label>
      <input value={s[key] ?? ""} onChange={(e) => setS({ ...s, [key]: e.target.value })} />
    </>
  );
  return (
    <div className="stay">
      <div className="dayedit">
        {field("name", "name")}
        {field("dates", "dates")}
        {field("address", "address")}
        {field("confirmation #", "conf")}
        {field("notes", "notes")}
        <div className="row">
          <button
            className="btn sm"
            onClick={() =>
              // Spread keeps any extra fields pasted in via the JSON editor.
              props.onSave({
                ...s,
                name: (s.name ?? "").trim(),
                dates: (s.dates ?? "").trim(),
                address: (s.address ?? "").trim(),
                conf: (s.conf ?? "").trim(),
                notes: (s.notes ?? "").trim(),
              })
            }
          >
            Save
          </button>
          <button className="btn sm ghost" onClick={props.onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Stays({ stays, save, syncNonce }: Props) {
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState({ name: "", dates: "", address: "", conf: "", notes: "" });

  // A newer copy from the server may have reordered or removed stays, so an
  // open editor could save over the wrong one — close it instead.
  useEffect(() => setEditing(null), [syncNonce]);

  const saveStays = (update: (cur: Stay[]) => Stay[]) =>
    save((c) => ({ ...c, stays: update(c.stays || []) }));

  const addStay = () => {
    const name = draft.name.trim();
    if (!name) return;
    saveStays((cur) => [
      ...cur,
      {
        name,
        dates: draft.dates.trim(),
        address: draft.address.trim(),
        conf: draft.conf.trim(),
        notes: draft.notes.trim(),
      },
    ]);
    setDraft({ name: "", dates: "", address: "", conf: "", notes: "" });
  };

  const deleteStay = (i: number) => {
    if (!confirm(`Delete "${stays[i].name || "this stay"}" for everyone?`)) return;
    setEditing(null);
    saveStays((cur) => cur.filter((_, x) => x !== i));
  };

  return (
    <>
      <div>
        {stays.length === 0 && editing === null && (
          <p className="hint">No stays yet — add your hotels below, or paste updated trip data in Settings.</p>
        )}
        {stays.map((s, i) => {
          if (editing === i) {
            return (
              <StayEditor
                key={i}
                stay={s}
                onSave={(next) => {
                  setEditing(null);
                  saveStays((cur) => cur.map((x, xi) => (xi === i ? next : x)));
                }}
                onCancel={() => setEditing(null)}
              />
            );
          }
          const booked = !!s.conf?.trim();
          const mapUrl =
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent((s.name || "") + " " + (s.address || ""));
          return (
            <div key={i} className={"stay" + (booked ? "" : " unbooked")}>
              <button className="del" aria-label="Delete stay" onClick={() => deleteStay(i)}>✕</button>
              <button className="edit2" aria-label="Edit stay" onClick={() => setEditing(i)}>✎</button>
              <div className="nm">{s.name}</div>
              <div className="dt">{s.dates || ""}</div>
              {s.address && (
                <div className="ad">
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer">{s.address}</a>
                </div>
              )}
              <div className="cf">{booked ? <>Conf: <b>{s.conf}</b></> : <b className="no">NOT BOOKED</b>}</div>
              {s.notes && <div className="nt">{s.notes}</div>}
            </div>
          );
        })}
      </div>
      <div className="addform">
        <input type="text" placeholder="Hotel / stay name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <input type="text" placeholder="Dates (e.g. Sep 20–25)" value={draft.dates} onChange={(e) => setDraft({ ...draft, dates: e.target.value })} />
        <input type="text" placeholder="Address" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
        <input type="text" placeholder="Confirmation # (leave blank if not booked)" value={draft.conf} onChange={(e) => setDraft({ ...draft, conf: e.target.value })} />
        <input type="text" placeholder="Notes (check-in time, deadlines...)" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
        <button className="btn" onClick={addStay}>Add stay</button>
      </div>
    </>
  );
}
