import type { ListItem } from "../types";
import type { SaveFn } from "../useTrip";
import { PACKING_SEED } from "../lists";
import Checklist from "./Checklist";

// What to take, grouped by category. Same shared checklist as Shopping.

export default function Packing({ packing, save }: { packing: ListItem[]; save: SaveFn }) {
  return (
    <>
      <div className="listintro">
        <p>
          <b>September in Japan is hot, humid and wet</b> — around 28–32°C, sticky, and the tail of typhoon season.
          Pack for high summer with a rain layer, not for autumn.
        </p>
      </div>
      <Checklist
        field="packing"
        items={packing}
        save={save}
        seed={PACKING_SEED}
        doneWord="packed"
        groupLabel="Category"
        whatPlaceholder="Something to pack (e.g. Travel adapter)"
        hint="Tap ✎ on any line to add your own details. Everything here syncs to every phone."
      />
    </>
  );
}
