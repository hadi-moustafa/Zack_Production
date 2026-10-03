"use client";

import { useMemo, useState } from "react";
import type { PricingPackage, PricingSection } from "@/lib/types";
import { groupPricing } from "@/lib/pricing";
import { Card, SectionHeading, Label, TextInput, SecondaryButton, DangerLink } from "@/components/admin/ui";
import { IconClose } from "@/components/icons";

const SECTION_LABEL: Record<PricingSection, string> = { packages: "Part 1 · Packages", singles: "Part 2 · Singles" };

export default function PricingManager({ initialPackages }: { initialPackages: PricingPackage[] }) {
  const [items, setItems] = useState<PricingPackage[]>(initialPackages);
  const [error, setError] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState<{ section: PricingSection; name: string }>({ section: "singles", name: "" });

  const grouped = useMemo(() => groupPricing(items), [items]);
  const legacy = items.filter((i) => !i.group_name?.trim());
  const groupNames = useMemo(() => Array.from(new Set(items.map((i) => i.group_name).filter(Boolean))), [items]);

  function patchLocal(id: string, patch: Partial<PricingPackage>) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  async function save(item: PricingPackage) {
    setError(null);
    const res = await fetch("/api/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) setError((await res.json().catch(() => ({}))).error ?? "Couldn't save.");
  }

  async function create(section: PricingSection, group: string, sortOrder: number) {
    setError(null);
    const res = await fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, group_name: group, name: "New item", price: "", features: [], sort_order: sortOrder }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) setItems((prev) => [...prev, body.package]);
    else setError(body.error ?? "Couldn't add the item.");
  }

  async function remove(id: string) {
    if (!confirm("Delete this item from the price list?")) return;
    const res = await fetch(`/api/pricing?id=${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((p) => p.id !== id));
  }

  // Swaps sort order with the neighbour in the same group.
  async function move(group: PricingPackage[], index: number, dir: -1 | 1) {
    const a = group[index];
    const b = group[index + dir];
    if (!a || !b) return;
    const next = [
      { ...a, sort_order: b.sort_order },
      { ...b, sort_order: a.sort_order === b.sort_order ? a.sort_order + dir : a.sort_order },
    ];
    next.forEach((n) => patchLocal(n.id, { sort_order: n.sort_order }));
    await Promise.all(next.map(save));
  }

  const maxOrder = items.reduce((m, i) => Math.max(m, i.sort_order), 0);

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading
          title="Price list"
          description="Items are grouped under headings in two parts: Packages and Singles. Items with “What's included” lines show as cards; the rest show as a tappable price list. Leave the price blank to show “Price on request”. Changes save when you leave a field."
        />
        {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {legacy.length > 0 ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {legacy.length} old item(s) have no group and are hidden on the site. Run <code>supabase/pricing-2026-10.sql</code> in
            Supabase to load the new price list.
          </p>
        ) : null}
      </Card>

      {(["packages", "singles"] as const).map((section) => (
        <div key={section} className="space-y-4">
          <h2 className="px-1 text-sm font-semibold uppercase tracking-widest text-neutral-500">{SECTION_LABEL[section]}</h2>
          {grouped[section].length === 0 ? <p className="px-1 text-sm text-neutral-500">No groups yet.</p> : null}
          {grouped[section].map((group) => (
            <Card key={group.name}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-neutral-900">{group.name}</h3>
                <span className="text-xs text-neutral-500">{group.layout === "cards" ? "Shown as cards" : "Shown as price list"}</span>
              </div>
              <div className="space-y-3">
                {group.items.map((item, index) => (
                  <ItemEditor
                    key={item.id}
                    item={item}
                    groupNames={groupNames}
                    first={index === 0}
                    last={index === group.items.length - 1}
                    onChange={(patch) => patchLocal(item.id, patch)}
                    onSave={(patch) => save({ ...item, ...patch })}
                    onMove={(dir) => move(group.items, index, dir)}
                    onDelete={() => remove(item.id)}
                  />
                ))}
              </div>
              <SecondaryButton
                className="mt-4"
                onClick={() => create(section, group.name, Math.max(...group.items.map((i) => i.sort_order)) + 1)}
              >
                + Add item to {group.name}
              </SecondaryButton>
            </Card>
          ))}
        </div>
      ))}

      <Card>
        <SectionHeading title="Add a new group" description="Creates a heading with one item you can then edit." />
        <div className="grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
          <div>
            <Label htmlFor="new-group-section">Part</Label>
            <select
              id="new-group-section"
              value={newGroup.section}
              onChange={(e) => setNewGroup((g) => ({ ...g, section: e.target.value as PricingSection }))}
              className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-[15px]"
            >
              <option value="packages">Packages</option>
              <option value="singles">Singles</option>
            </select>
          </div>
          <div>
            <Label htmlFor="new-group-name">Group heading</Label>
            <TextInput
              id="new-group-name"
              value={newGroup.name}
              onChange={(e) => setNewGroup((g) => ({ ...g, name: e.target.value }))}
              placeholder="e.g. Engagement Packages"
            />
          </div>
          <SecondaryButton
            disabled={!newGroup.name.trim()}
            onClick={async () => {
              await create(newGroup.section, newGroup.name.trim(), maxOrder + 10);
              setNewGroup((g) => ({ ...g, name: "" }));
            }}
          >
            Add group
          </SecondaryButton>
        </div>
      </Card>
    </div>
  );
}

function ItemEditor({
  item,
  groupNames,
  first,
  last,
  onChange,
  onSave,
  onMove,
  onDelete,
}: {
  item: PricingPackage;
  groupNames: string[];
  first: boolean;
  last: boolean;
  onChange: (patch: Partial<PricingPackage>) => void;
  onSave: (patch?: Partial<PricingPackage>) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const listId = `groups-${item.id}`;

  return (
    <div className="rounded-lg border border-neutral-200 p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_8rem_auto] sm:items-center">
        <TextInput
          aria-label="Name"
          value={item.name}
          onChange={(e) => onChange({ name: e.target.value })}
          onBlur={() => onSave()}
          className="!mt-0"
        />
        <TextInput
          aria-label="Price"
          value={item.price}
          onChange={(e) => onChange({ price: e.target.value })}
          onBlur={() => onSave()}
          placeholder="On request"
          className="!mt-0"
        />
        <div className="flex items-center gap-1">
          <IconButton label="Move up" disabled={first} onClick={() => onMove(-1)}>
            ↑
          </IconButton>
          <IconButton label="Move down" disabled={last} onClick={() => onMove(1)}>
            ↓
          </IconButton>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="h-10 rounded-lg px-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-100"
            aria-expanded={open}
          >
            {open ? "Less" : "More"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mt-3 space-y-3 border-t border-neutral-100 pt-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Part</Label>
              <select
                value={item.section}
                onChange={(e) => {
                  const section = e.target.value as PricingSection;
                  onChange({ section });
                  onSave({ section });
                }}
                className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-[15px]"
              >
                <option value="packages">Packages</option>
                <option value="singles">Singles</option>
              </select>
            </div>
            <div>
              <Label>Group heading</Label>
              <TextInput
                list={listId}
                value={item.group_name}
                onChange={(e) => onChange({ group_name: e.target.value })}
                onBlur={() => onSave()}
              />
              <datalist id={listId}>
                {groupNames.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
            <div>
              <Label>Badge (optional)</Label>
              <TextInput
                value={item.badge ?? ""}
                maxLength={40}
                placeholder="e.g. Recommended, Up to 20% off"
                onChange={(e) => onChange({ badge: e.target.value })}
                onBlur={() => onSave()}
              />
            </div>
            <label className="flex items-center gap-2 pb-2.5 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={item.highlighted ?? false}
                onChange={(e) => {
                  onChange({ highlighted: e.target.checked });
                  onSave({ highlighted: e.target.checked });
                }}
                className="h-4 w-4 accent-neutral-900"
              />
              Highlight (gold border; the badge becomes a ribbon)
            </label>
          </div>

          <div>
            <Label>What&apos;s included (optional, turns the group into cards)</Label>
            <div className="mt-1.5 space-y-2">
              {item.features.map((feature, i) => (
                <div key={i} className="flex gap-2">
                  <TextInput
                    value={feature}
                    onChange={(e) => {
                      const features = [...item.features];
                      features[i] = e.target.value;
                      onChange({ features });
                    }}
                    onBlur={() => onSave()}
                    className="!mt-0"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const features = item.features.filter((_, x) => x !== i);
                      onChange({ features });
                      onSave({ features });
                    }}
                    aria-label="Remove line"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-300 text-neutral-500 transition hover:border-red-400 hover:text-red-600"
                  >
                    <IconClose className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onChange({ features: [...item.features, ""] })}
              className="mt-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:underline"
            >
              + Add line
            </button>
          </div>

          <div className="flex justify-end">
            <DangerLink onClick={onDelete}>Delete item</DangerLink>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 transition hover:border-neutral-900 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
