import { useSyncExternalStore } from "react";

// What the visitor has picked in the pricing section, shared with the
// contact form and the sticky mobile bar without any server state.

export type SelectedItem = {
  id: string;
  /** e.g. "Gold" or "Zaffe shooting". */
  name: string;
  /** Group heading, e.g. "Wedding Packages". */
  group: string;
  /** Display price, or "" when on request. */
  price: string;
  /** Picking another item from the same exclusive group replaces this one. */
  exclusive: boolean;
};

const EMPTY: SelectedItem[] = [];
let items: SelectedItem[] = EMPTY;
const listeners = new Set<() => void>();

function set(next: SelectedItem[]) {
  items = next;
  listeners.forEach((l) => l());
}

export const planSelection = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  get: () => items,
  has: (id: string) => items.some((i) => i.id === id),
  /** Adds the item (replacing a sibling if exclusive), or removes it if already picked. */
  toggle(item: SelectedItem) {
    if (items.some((i) => i.id === item.id)) {
      set(items.filter((i) => i.id !== item.id));
      return;
    }
    const kept = item.exclusive ? items.filter((i) => !(i.exclusive && i.group === item.group)) : items;
    set([...kept, item]);
  },
  /** Ensures the item is picked (never removes it). */
  select(item: SelectedItem) {
    if (!items.some((i) => i.id === item.id)) planSelection.toggle(item);
  },
  remove(id: string) {
    set(items.filter((i) => i.id !== id));
  },
  clear() {
    set(EMPTY);
  },
};

export function usePlanSelection() {
  return useSyncExternalStore(planSelection.subscribe, planSelection.get, () => EMPTY);
}

/** One line per pick, for the WhatsApp message and the saved lead. */
export function describeSelection(selected: SelectedItem[]) {
  return selected.map((i) => `• ${i.name} (${i.group})${i.price ? ` · ${i.price}` : ""}`).join("\n");
}
