import type { FoodRegion } from "../types";

// Dishes to eat, grouped by region. Edited via Settings → Trip data.

export default function Food({ food }: { food: FoodRegion[] }) {
  return (
    <div>
      {food.map((f, fi) => (
        <div key={fi} className="food-region">
          <h3>{f.r}</h3>
          {(f.items || []).map((d, di) => (
            <div key={di} className="dish">
              <div className="t">{d.t}</div>
              <p>{d.p}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
