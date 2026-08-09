import { useEffect, useState } from "react";
import { raw } from "../storage";

// ¥ ⇄ $ converter. The live rate is cached for 6 hours (localStorage) and the
// last known rate is used when offline. Two free APIs, second is a fallback.

const FX_QUICK = [100, 500, 1000, 3000, 5000, 10000, 50000, 100000];
const CACHE_MS = 6 * 3600 * 1000;

interface RateInfo {
  msg: string;
  ok?: boolean;
}

export default function Currency() {
  const [rate, setRate] = useState<number | null>(null);
  const [info, setInfo] = useState<RateInfo>({ msg: "Loading rate…" });
  const [jpy, setJpy] = useState("");
  const [usd, setUsd] = useState("");

  const fetchRate = async (force: boolean) => {
    const cachedRate = parseFloat(raw.get("fx_rate") || "");
    const cachedTs = parseInt(raw.get("fx_rate_ts") || "0", 10);
    const fresh = cachedTs > 0 && Date.now() - cachedTs < CACHE_MS;
    if (!force && cachedRate && fresh) {
      setRate(cachedRate);
      setInfo({ msg: "1 ¥ = $" + cachedRate.toFixed(5) + " · updated " + new Date(cachedTs).toLocaleString(), ok: true });
      return;
    }
    setInfo({ msg: "Fetching latest rate…" });
    let live: number | null = null;
    try {
      const r = await fetch("https://api.frankfurter.dev/v1/latest?base=JPY&symbols=USD");
      const j = await r.json();
      live = j?.rates?.USD ?? null;
    } catch {
      /* try the fallback API */
    }
    if (!live) {
      try {
        const r = await fetch("https://open.er-api.com/v6/latest/JPY");
        const j = await r.json();
        live = j?.rates?.USD ?? null;
      } catch {
        /* offline */
      }
    }
    if (live) {
      setRate(live);
      raw.set("fx_rate", String(live));
      raw.set("fx_rate_ts", String(Date.now()));
      setInfo({ msg: "1 ¥ = $" + live.toFixed(5) + " · live", ok: true });
    } else if (cachedRate) {
      setRate(cachedRate);
      setInfo({ msg: "Offline — using rate from " + new Date(cachedTs).toLocaleString(), ok: false });
    } else {
      setInfo({ msg: "Couldn't fetch a rate — try again when online.", ok: false });
    }
  };

  useEffect(() => {
    void fetchRate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onJpy = (v: string) => {
    setJpy(v);
    const n = parseFloat(v.replace(/,/g, ""));
    setUsd(rate && !isNaN(n) ? (n * rate).toFixed(2) : "");
  };
  const onUsd = (v: string) => {
    setUsd(v);
    const n = parseFloat(v.replace(/,/g, ""));
    setJpy(rate && !isNaN(n) ? Math.round(n / rate).toLocaleString() : "");
  };

  return (
    <>
      <div className="set-card">
        <h3>¥ ⇄ $ Converter</h3>
        <p className={info.ok === undefined ? "" : info.ok ? "ok" : "err"}>{info.msg}</p>
        <div className="fx-row">
          <label>Yen</label>
          <input type="text" inputMode="decimal" placeholder="0" value={jpy} onChange={(e) => onJpy(e.target.value)} />
        </div>
        <div className="fx-row">
          <label>Dollars</label>
          <input type="text" inputMode="decimal" placeholder="0" value={usd} onChange={(e) => onUsd(e.target.value)} />
        </div>
        <button className="btn ghost" onClick={() => void fetchRate(true)}>Refresh rate</button>
      </div>
      <div className="set-card">
        <h3>Quick reference</h3>
        <div id="fxquick">
          {rate &&
            FX_QUICK.map((y) => (
              <div key={y} className="fxq">
                <span>¥{y.toLocaleString()}</span>
                <span>${(y * rate).toFixed(2)}</span>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
