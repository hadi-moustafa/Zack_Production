"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DESIGNS, DESIGN_IDS, type DesignId } from "@/lib/design";
import { Card, SectionHeading, PrimaryButton } from "@/components/admin/ui";

// A miniature of each design, drawn in its own colours.
const SWATCH: Record<DesignId, React.ReactNode> = {
  classic: (
    <div className="flex h-full flex-col justify-end bg-[#0a0a0a] p-4">
      <p className="text-[0.6rem] uppercase tracking-[0.2em] text-[#e8c169]">Photography &amp; Film</p>
      <p className="mt-1 font-serif text-3xl italic text-[#f5f2ea]">Real Moments</p>
      <span className="mt-3 h-px w-16 bg-[#c9a24b]" />
    </div>
  ),
  headliner: (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[#050506] p-4">
      <p
        className="text-[3.4rem] font-bold uppercase leading-[0.8] text-transparent"
        style={{ fontStretch: "75%", WebkitTextStroke: "1px #f7f4ff", backgroundImage: "linear-gradient(90deg,#ff2e7e,#8a5cff,#3d7bff)", WebkitBackgroundClip: "text", backgroundClip: "text" }}
      >
        Zack
      </p>
      <span className="absolute -left-4 bottom-8 w-[120%] -rotate-3 bg-[#d4ff2e] py-1 text-center text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#050506]">
        ✦ Best DoP ✦ Filmmaker ✦ Editor ✦
      </span>
      <p className="font-serif text-lg italic text-[#ff2e7e]">Real Moments</p>
    </div>
  ),
};

export default function DesignPicker({ initialDesign }: { initialDesign: DesignId }) {
  const router = useRouter();
  const [live, setLive] = useState<DesignId>(initialDesign);
  const [saving, setSaving] = useState<DesignId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(design: DesignId) {
    setSaving(design);
    setError(null);
    const res = await fetch("/api/design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ design }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(null);
    if (res.ok) {
      setLive(design);
      router.refresh();
    }
    else setError(json.error || "Couldn't switch the design.");
  }

  return (
    <Card>
      <SectionHeading
        title="Site design"
        description="Pick how the public site looks. Both designs use the same photos, films, text, prices and contact details, so you can switch back and forth any time without losing anything. Preview opens a design in a new tab without changing the live site."
      />
      {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <ul className="grid gap-4 sm:grid-cols-2">
        {DESIGN_IDS.map((id) => {
          const isLive = live === id;
          return (
            <li key={id} className={`overflow-hidden rounded-xl border-2 ${isLive ? "border-neutral-900" : "border-neutral-200"}`}>
              <div className="aspect-[16/9]">{SWATCH[id]}</div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-neutral-900">{DESIGNS[id].name}</h3>
                  {isLive ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Live now</span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-neutral-600">{DESIGNS[id].summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {isLive ? null : (
                    <PrimaryButton onClick={() => choose(id)} disabled={saving !== null}>
                      {saving === id ? "Switching…" : "Make this live"}
                    </PrimaryButton>
                  )}
                  <a
                    href={`/preview/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                  >
                    Preview ↗
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
