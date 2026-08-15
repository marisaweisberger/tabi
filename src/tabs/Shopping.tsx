import type { ListItem } from "../types";
import type { SaveFn } from "../useTrip";
import { SHOPPING_SEED } from "../lists";
import Checklist from "./Checklist";

// Practical things to buy in Japan, grouped by the part of Tokyo you buy them
// in — so a group lines up with a day on the itinerary.

export default function Shopping({ shopping, save }: { shopping: ListItem[]; save: SaveFn }) {
  return (
    <>
      <div className="listintro">
        <p>
          <b>Tax-free:</b> spend ¥5,000 or more in one shop on one day, show your physical passport, and the 10%
          consumption tax comes off. Say so before you pay — bigger shops have a separate tax-free counter.
        </p>
        <p>
          <b>Knives go in checked luggage.</b> Never in your carry-on, however well wrapped.
        </p>
        <p>
          <b>Japan is 100V</b> — anything that heats or spins may not be happy on the plug at home.
        </p>
      </div>
      <Checklist
        field="shopping"
        items={shopping}
        save={save}
        seed={SHOPPING_SEED}
        doneWord="bought"
        groupLabel="Where to buy it"
        whatPlaceholder="Something to buy (e.g. Kettle for the tea)"
        hint="Headings are places — open the one you're standing in. Ticks and notes sync to every phone."
      />
    </>
  );
}
