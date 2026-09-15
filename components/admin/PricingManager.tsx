"use client";

import { useState } from "react";
import type { PricingPackage } from "@/lib/types";

export default function PricingManager({
  initialPackages,
}: {
  initialPackages: PricingPackage[];
}) {
  const [packages, setPackages] = useState<PricingPackage[]>(initialPackages);

  function updateField(id: string, field: "name" | "price", value: string) {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  function updateFeature(id: string, index: number, value: string) {
    setPackages((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const features = [...p.features];
        features[index] = value;
        return { ...p, features };
      })
    );
  }

  function addFeature(id: string) {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, features: [...p.features, ""] } : p))
    );
  }

  function removeFeature(id: string, index: number) {
    setPackages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, features: p.features.filter((_, i) => i !== index) } : p
      )
    );
  }

  async function savePackage(pkg: PricingPackage) {
    await fetch("/api/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pkg),
    });
  }

  async function addPackage() {
    const res = await fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New package",
        price: "$0",
        features: [],
        sort_order: packages.length,
      }),
    });
    const body = await res.json();
    if (res.ok) setPackages((prev) => [...prev, body.package]);
  }

  async function deletePackage(id: string) {
    if (!confirm("Delete this pricing package?")) return;
    const res = await fetch(`/api/pricing?id=${id}`, { method: "DELETE" });
    if (res.ok) setPackages((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <section>
      <h2 className="text-lg font-semibold">Pricing packages</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {packages.map((pkg) => (
          <div key={pkg.id} className="rounded-md border border-neutral-200 p-4">
            <input
              value={pkg.name}
              onChange={(e) => updateField(pkg.id, "name", e.target.value)}
              onBlur={() => savePackage(pkg)}
              className="w-full rounded border border-neutral-200 px-2 py-1 text-sm font-medium"
              placeholder="Package name"
            />
            <input
              value={pkg.price}
              onChange={(e) => updateField(pkg.id, "price", e.target.value)}
              onBlur={() => savePackage(pkg)}
              className="mt-2 w-full rounded border border-neutral-200 px-2 py-1 text-sm"
              placeholder="$500"
            />

            <div className="mt-3 space-y-1">
              {pkg.features.map((feature, i) => (
                <div key={i} className="flex gap-1">
                  <input
                    value={feature}
                    onChange={(e) => updateFeature(pkg.id, i, e.target.value)}
                    onBlur={() => savePackage(pkg)}
                    className="w-full rounded border border-neutral-200 px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => {
                      removeFeature(pkg.id, i);
                      savePackage({ ...pkg, features: pkg.features.filter((_, x) => x !== i) });
                    }}
                    className="px-2 text-xs text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => addFeature(pkg.id)}
              className="mt-2 text-xs text-neutral-600 hover:underline"
            >
              + Add item
            </button>

            <div className="mt-3 flex justify-end">
              <button
                onClick={() => deletePackage(pkg.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Delete package
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addPackage}
        className="mt-4 rounded-md border border-neutral-300 px-4 py-2 text-sm hover:border-neutral-900"
      >
        + Add package
      </button>
    </section>
  );
}
