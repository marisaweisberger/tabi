import { useState } from "react";
import type { ListItem } from "../types";
import type { SaveFn } from "../useTrip";

// A tickable list with headings, shared by the Shopping and Packing tabs.
// Ticks, notes and new lines are part of the trip JSON, so they sync to every
// phone the same way bookings do.

interface Props {
  /** Which list on the trip this is */
  field: "shopping" | "packing";
  items: ListItem[];
  save: SaveFn;
  /** Offered as a one-tap starting point while the list is empty */
  seed: ListItem[];
  /** "bought" / "packed" */
  doneWord: string;
  /** What a heading means here, e.g. "Where to buy it" */
  groupLabel: string;
  whatPlaceholder: string;
  hint: string;
}

const UNGROUPED = "Everything else";

/** Split the list into headed groups, keeping the order they appear in. */
function groupItems(items: ListItem[]): { name: string; items: ListItem[] }[] {
  const groups: { name: string; items: ListItem[] }[] = [];
  for (const it of items) {
    const name = it.g?.trim() || UNGROUPED;
    let g = groups.find((x) => x.name === name);
    if (!g) groups.push((g = { name, items: [] }));
    g.items.push(it);
  }
  return groups;
}

function ItemEditor(props: { item: ListItem; groupLabel: string; onSave: (i: ListItem) => void; onCancel: () => void; onDelete: () => void }) {
  const [t, setT] = useState(props.item.t || "");
  const [m, setM] = useState(props.item.m || "");
  const [g, setG] = useState(props.item.g || "");

  const commit = () => {
    const next: ListItem = { ...props.item, t: t.trim() || "Untitled" };
    if (m.trim()) next.m = m.trim();
    else delete next.m;
    if (g.trim()) next.g = g.trim();
    else delete next.g;
    props.onSave(next);
  };

  return (
    <div className="dayedit">
      <label>what</label>
      <input value={t} onChange={(e) => setT(e.target.value)} />
      <label>notes</label>
      <textarea value={m} onChange={(e) => setM(e.target.value)} />
      <label>{props.groupLabel}</label>
      <input value={g} onChange={(e) => setG(e.target.value)} />
      <div className="row">
        <button className="btn sm" onClick={commit}>Save</button>
        <button className="btn sm ghost" onClick={props.onCancel}>Cancel</button>
        <button className="btn sm danger" onClick={props.onDelete}>Delete</button>
      </div>
    </div>
  );
}

export default function Checklist({ field, items, save, seed, doneWord, groupLabel, whatPlaceholder, hint }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [hideDone, setHideDone] = useState(false);
  const [what, setWhat] = useState("");
  const [note, setNote] = useState("");
  const [group, setGroup] = useState("");

  // Written out per field rather than with a computed key, so TypeScript can
  // still see the shape of the trip.
  const saveItems = (update: (cur: ListItem[]) => ListItem[]) =>
    save((c) =>
      field === "shopping"
        ? { ...c, shopping: update(c.shopping || []) }
        : { ...c, packing: update(c.packing || []) },
    );

  const done = items.filter((i) => i.done).length;
  const groups = groupItems(hideDone ? items.filter((i) => !i.done) : items);
  const knownGroups = [...new Set(items.map((i) => i.g?.trim()).filter(Boolean))];

  const addItem = () => {
    const t = what.trim();
    if (!t) return;
    const item: ListItem = { id: field[0] + Date.now(), t };
    if (note.trim()) item.m = note.trim();
    if (group.trim()) item.g = group.trim();
    saveItems((cur) => [...cur, item]);
    setWhat("");
    setNote("");
    // The group is kept, so several things in a row can go under one heading.
  };

  const removeItem = (it: ListItem) => {
    if (!confirm(`Delete "${it.t}" for everyone on this trip?`)) return;
    setEditing(null);
    saveItems((cur) => cur.filter((x) => x.id !== it.id));
  };

  return (
    <>
      <div className="progress">
        <div className="prow">
          <span>
            {done} / {items.length} {doneWord}
          </span>
          <label className="togdone">
            <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} /> hide {doneWord}
          </label>
        </div>
        <div className="bar">
          <div style={{ width: items.length ? (done / items.length) * 100 + "%" : 0 }} />
        </div>
      </div>

      {items.length === 0 && (
        <div className="banner">
          Nothing on this list yet. Start from the suggested one — then tick off, edit or delete anything you like.
          <br />
          <button onClick={() => saveItems(() => structuredClone(seed))}>Add the suggested list ({seed.length} items)</button>
        </div>
      )}

      {groups.map((grp) => (
        <div key={grp.name} className="list-group">
          <h3>{grp.name}</h3>
          {grp.items.map((it) =>
            editing === it.id ? (
              <div key={it.id} className="bk editing">
                <ItemEditor
                  item={it}
                  groupLabel={groupLabel}
                  onSave={(next) => {
                    setEditing(null);
                    saveItems((cur) => cur.map((x) => (x.id === next.id ? next : x)));
                  }}
                  onCancel={() => setEditing(null)}
                  onDelete={() => removeItem(it)}
                />
              </div>
            ) : (
              <label key={it.id} className={"bk" + (it.done ? " done" : "")}>
                <input
                  type="checkbox"
                  checked={!!it.done}
                  aria-label={it.t}
                  onChange={(e) =>
                    saveItems((cur) => cur.map((x) => (x.id === it.id ? { ...x, done: e.target.checked } : x)))
                  }
                />
                <div>
                  <span className="t">{it.t}</span>
                  {it.m && <div className="m">{it.m}</div>}
                </div>
                <button
                  className="edit2"
                  aria-label={`Edit ${it.t}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setEditing(it.id);
                  }}
                >
                  ✎
                </button>
                <button
                  className="del"
                  aria-label={`Delete ${it.t}`}
                  onClick={(e) => {
                    e.preventDefault();
                    removeItem(it);
                  }}
                >
                  ✕
                </button>
              </label>
            ),
          )}
        </div>
      ))}

      <div className="addform">
        <input type="text" placeholder={whatPlaceholder} value={what} onChange={(e) => setWhat(e.target.value)} />
        <input type="text" placeholder="Notes (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <input
          type="text"
          list={field + "-groups"}
          placeholder={groupLabel}
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        />
        <datalist id={field + "-groups"}>
          {knownGroups.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
        <button className="btn" onClick={addItem}>Add to the list</button>
      </div>
      <p className="hint">{hint}</p>
    </>
  );
}
