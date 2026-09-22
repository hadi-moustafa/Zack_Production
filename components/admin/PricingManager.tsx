"use client";

import { useState } from "react";
import type { PricingPackage } from "@/lib/types";
import { Card, SectionHeading, Label, TextInput, SecondaryButton, DangerLink } from "@/components/admin/ui";
import { IconClose } from "@/components/icons";

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
    <Card>
      <SectionHeading
        title="Pricing packages"
        description="Leave the price blank on a package (e.g. a “Custom” tier) to show it as a contact-me card instead of a priced one."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {packages.map((pkg) => (
          <div key={pkg.id} className="rounded-lg border border-neutral-200 p-4">
            <Label>Package name</Label>
            <TextInput
              value={pkg.name}
              onChange={(e) => updateField(pkg.id, "name", e.target.value)}
              onBlur={() => savePackage(pkg)}
              placeholder="Standard"
            />
            <div className="mt-3">
              <Label>Price</Label>
              <TextInput
                value={pkg.price}
                onChange={(e) => updateField(pkg.id, "price", e.target.value)}
                onBlur={() => savePackage(pkg)}
                placeholder="$500"
              />
            </div>

            <div className="mt-3">
              <Label>What&apos;s included</Label>
              <div className="mt-1.5 space-y-2">
                {pkg.features.map((feature, i) => (
                  <div key={i} className="flex gap-2">
                    <TextInput
                      value={feature}
                      onChange={(e) => updateFeature(pkg.id, i, e.target.value)}
                      onBlur={() => savePackage(pkg)}
                      className="!mt-0"
                      placeholder="1 hour session"
                    />
                    <button
                      onClick={() => {
                        removeFeature(pkg.id, i);
                        savePackage({ ...pkg, features: pkg.features.filter((_, x) => x !== i) });
                      }}
                      aria-label="Remove item"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-300 text-neutral-500 transition hover:border-red-400 hover:text-red-600"
                    >
                      <IconClose className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addFeature(pkg.id)}
                className="mt-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:underline"
              >
                + Add item
              </button>
            </div>

            <div className="mt-4 flex justify-end border-t border-neutral-100 pt-3">
              <DangerLink onClick={() => deletePackage(pkg.id)}>Delete package</DangerLink>
            </div>
          </div>
        ))}
      </div>

      <SecondaryButton onClick={addPackage} className="mt-5">
        + Add package
      </SecondaryButton>
    </Card>
  );
}
