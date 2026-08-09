import { useState } from "react";
import type { Booking, TripContent } from "../types";

// Shared checklist with a progress bar. Checkmarks are part of the trip JSON,
// so they sync to every phone.

interface Props {
  content: TripContent;
  save: (next: TripContent) => void;
}

export default function Bookings({ content, save }: Props) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [urgent, setUrgent] = useState(false);

  const bookings = content.bookings || [];
  const done = bookings.filter((b) => b.done).length;
  const saveBookings = (next: Booking[]) => save({ ...content, bookings: next });

  const addBooking = () => {
    const t = title.trim();
    if (!t) return;
    saveBookings([...bookings, { id: "b" + Date.now(), t, m: details.trim(), u: urgent ? "URGENT" : "" }]);
    setTitle("");
    setDetails("");
    setUrgent(false);
  };

  return (
    <>
      <div id="progress">
        <span>{done} / {bookings.length} booked</span>
        <div id="bar">
          <div style={{ width: bookings.length ? (done / bookings.length) * 100 + "%" : 0 }} />
        </div>
      </div>
      <div>
        {bookings.map((b) => (
          <label key={b.id} className={"bk" + (b.done ? " done" : "")}>
            <input
              type="checkbox"
              checked={!!b.done}
              aria-label={b.t}
              onChange={(e) => saveBookings(bookings.map((x) => (x.id === b.id ? { ...x, done: e.target.checked } : x)))}
            />
            <div>
              {b.u && <span className="u">{b.u}</span>} <span className="t">{b.t}</span>
              <div className="m">{b.m}</div>
            </div>
            <button
              className="del"
              aria-label={`Delete ${b.t}`}
              onClick={(e) => {
                e.preventDefault();
                if (!confirm(`Delete "${b.t}" for everyone on this trip?`)) return;
                saveBookings(bookings.filter((x) => x.id !== b.id));
              }}
            >
              ✕
            </button>
          </label>
        ))}
      </div>
      <div className="addform">
        <input type="text" placeholder="New booking — title (e.g. Sumo tickets)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Details (dates, links, notes)" value={details} onChange={(e) => setDetails(e.target.value)} />
        <label className="chk">
          <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} /> Urgent
        </label>
        <button className="btn" onClick={addBooking}>Add booking</button>
      </div>
      <p className="hint">Checkmarks sync to every phone. Quick notes on days stay on yours.</p>
    </>
  );
}
