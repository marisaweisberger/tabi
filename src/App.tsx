import { useEffect, useState } from "react";
import { useTrip } from "./useTrip";
import Itinerary from "./tabs/Itinerary";
import Stays from "./tabs/Stays";
import Bookings from "./tabs/Bookings";
import Food from "./tabs/Food";
import Shopping from "./tabs/Shopping";
import Packing from "./tabs/Packing";
import Currency from "./tabs/Currency";
import Settings from "./tabs/Settings";

const TABS = [
  { id: "itin", icon: "🚉", label: "Itinerary" },
  { id: "stay", icon: "🏨", label: "Stays" },
  { id: "book", icon: "📋", label: "Bookings" },
  { id: "food", icon: "🍜", label: "Food" },
  { id: "shop", icon: "🛍️", label: "Shopping" },
  { id: "pack", icon: "🧳", label: "Packing" },
  { id: "fx", icon: "💴", label: "Currency" },
  { id: "set", icon: "⚙️", label: "Settings" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function daysToGo(departDate: string | undefined): string {
  if (!departDate) return "";
  const days = Math.max(0, Math.ceil((new Date(departDate + "T00:00:00").getTime() - Date.now()) / 86400000));
  return days > 0 ? days + " days to go" : "いってらっしゃい!";
}

export default function App() {
  const trip = useTrip();
  const [tab, setTab] = useState<TabId>("itin");

  // Re-pull from the server every 30s while someone is looking at Settings.
  useEffect(() => {
    if (tab !== "set") return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void trip.syncFromServer();
    }, 30000);
    return () => clearInterval(id);
  }, [tab, trip.syncFromServer]);

  const { content } = trip;
  if (!content) return null;
  const countdown = daysToGo(content.departDate);

  return (
    <>
      <header>
        <div className="hero-top">
          <h1>
            <span>旅</span>
            <span>{content.title || "Tabi"}</span>
          </h1>
          <span id="syncdot" className={trip.serverState === "on" ? "on" : ""} title="sync status" />
        </div>
        {countdown && (
          <div id="hstat">
            <span>{countdown}</span>
          </div>
        )}
      </header>

      <main>
        {trip.templateMode && (
          <div className="banner">
            Viewing the built-in template. Save it as your trip to make it editable and syncable.
            <br />
            <button onClick={() => trip.save((c) => c)}>Save template as my trip</button>
          </div>
        )}

        <section className={"tab" + (tab === "itin" ? " active" : "")}>
          <h2 className="page-title">
            Itinerary <span>旅程</span>
          </h2>
          <Itinerary regions={content.regions || []} save={trip.save} syncNonce={trip.syncNonce} />
        </section>

        <section className={"tab" + (tab === "stay" ? " active" : "")}>
          <h2 className="page-title">
            Stays <span>宿</span>
          </h2>
          <Stays stays={content.stays || []} save={trip.save} syncNonce={trip.syncNonce} />
        </section>

        <section className={"tab" + (tab === "book" ? " active" : "")}>
          <h2 className="page-title">
            Bookings <span>予約</span>
          </h2>
          <Bookings bookings={content.bookings || []} save={trip.save} />
        </section>

        <section className={"tab" + (tab === "food" ? " active" : "")}>
          <h2 className="page-title">
            Food <span>食</span>
          </h2>
          <Food food={content.food || []} />
        </section>

        <section className={"tab" + (tab === "shop" ? " active" : "")}>
          <h2 className="page-title">
            Shopping <span>買物</span>
          </h2>
          <Shopping shopping={content.shopping || []} save={trip.save} />
        </section>

        <section className={"tab" + (tab === "pack" ? " active" : "")}>
          <h2 className="page-title">
            Packing <span>荷造</span>
          </h2>
          <Packing packing={content.packing || []} save={trip.save} />
        </section>

        <section className={"tab" + (tab === "fx" ? " active" : "")}>
          <h2 className="page-title">
            Currency <span>両替</span>
          </h2>
          <Currency />
        </section>

        <section className={"tab" + (tab === "set" ? " active" : "")}>
          <h2 className="page-title">
            Settings <span>設定</span>
          </h2>
          <Settings content={content} save={trip.save} status={trip.status} />
        </section>
      </main>

      <nav>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? "on" : ""}
            onClick={() => {
              setTab(t.id);
              window.scrollTo(0, 0);
            }}
          >
            <span className="ic">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}
