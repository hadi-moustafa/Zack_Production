"use client";

import InView from "@/components/headliner/InView";
import { Kicker, SplitWords } from "@/components/headliner/Kinetic";
import { IconArrowRight } from "@/components/icons";
import { groupPricing, priceLabel, type PricingGroup } from "@/lib/pricing";
import { planSelection, usePlanSelection, type SelectedItem } from "@/lib/planSelection";
import { sfx } from "@/lib/sfx";
import type { PricingPackage } from "@/lib/types";

// Metallic band per wedding tier; anything else gets the flare gradient.
const TIER_BAND: Record<string, string> = {
  bronze: "linear-gradient(90deg, #e0a872, #8a5a2b)",
  silver: "linear-gradient(90deg, #f2f2f4, #8d8f97)",
  gold: "linear-gradient(90deg, #f6d98b, #a67f2e)",
  platinum: "linear-gradient(90deg, #ffffff, #b9c3cc, #ffffff)",
};
const FLARE_BAND = "linear-gradient(90deg, #ff2e7e, #8a5cff, #3d7bff)";

const CARD_COLUMNS: Record<number, string> = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" };

function toSelected(item: PricingPackage, group: PricingGroup): SelectedItem {
  return {
    id: item.id,
    name: item.name,
    group: group.name,
    price: item.price.trim(),
    // Only one tier of a card-style package group makes sense at a time.
    exclusive: group.layout === "cards",
  };
}

export default function HlPricing({
  packages,
  description,
  paymentNote,
}: {
  packages: PricingPackage[];
  description: string;
  paymentNote: string;
}) {
  const selected = usePlanSelection();
  const { packages: packageGroups, singles: singleGroups } = groupPricing(packages);
  if (packageGroups.length === 0 && singleGroups.length === 0) return null;
  const isSelected = (id: string) => selected.some((s) => s.id === id);

  return (
    <section id="pricing" className="relative overflow-hidden bg-[var(--bg-dark-alt)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <InView>
          <Kicker n="04">Pricing</Kicker>
          <h2 className="hl-display mt-5 text-[clamp(3.4rem,16vw,10rem)]">
            <SplitWords text="The rate" /> <span className="hl-em">card.</span>
          </h2>
          {description ? (
            <p className="hl-rise mt-5 max-w-xl text-[1.05rem] text-[var(--text-secondary)]" style={{ "--d": "250ms" } as React.CSSProperties}>
              {description}
            </p>
          ) : null}
        </InView>

        <div className="mt-14 space-y-16">
          {packageGroups.map((group) =>
            group.layout === "cards" ? (
              <Passes key={group.name} group={group} isSelected={isSelected} />
            ) : (
              <Menu key={group.name} group={group} isSelected={isSelected} />
            )
          )}
        </div>

        {singleGroups.length ? (
          <div className="mt-20">
            <h3 className="hl-display text-[clamp(2.5rem,10vw,5rem)]">
              À la <span className="hl-em">carte</span>
            </h3>
            <p className="mt-2 text-[var(--text-secondary)]">Book one service on its own, or add extras to a package. Tap to add.</p>
            <div className="mt-8 gap-10 lg:columns-2">
              {singleGroups.map((group) => (
                <div key={group.name} className="mb-10 break-inside-avoid">
                  {group.layout === "cards" ? (
                    <Passes group={group} isSelected={isSelected} />
                  ) : (
                    <Menu group={group} isSelected={isSelected} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {selected.length > 0 ? (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border-2 border-[var(--hl-volt)] bg-[var(--bg-dark)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3 sm:justify-start">
              <p>
                <span className="hl-display text-2xl">{selected.length} selected</span>
                <span className="text-[var(--text-secondary)]"> · in your booking request</span>
              </p>
              <button
                type="button"
                data-sfx="none"
                onClick={() => {
                  sfx.select(false);
                  planSelection.clear();
                }}
                className="inline-flex min-h-11 items-center px-2 text-[var(--text-secondary)] underline underline-offset-4 hover:text-[var(--text-primary)]"
              >
                Clear
              </button>
            </div>
            <a href="#contact" className="hl-btn whitespace-nowrap">
              Continue to booking <IconArrowRight aria-hidden className="h-4 w-4" />
            </a>
          </div>
        ) : null}

        {paymentNote ? (
          <div className="mt-12 border-t border-[var(--border-subtle)] pt-6">
            <p className="hl-label">Payment</p>
            <p className="mt-2 max-w-xl whitespace-pre-line text-base leading-relaxed text-[var(--text-secondary)]">{paymentNote}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

// Tiered packages as holographic all-access passes.
function Passes({ group, isSelected }: { group: PricingGroup; isSelected: (id: string) => boolean }) {
  return (
    <div>
      <h3 className="hl-label">{group.name}</h3>
      <InView as="ul" threshold={0.1} className={`mt-6 grid gap-6 sm:grid-cols-2 ${CARD_COLUMNS[Math.min(group.items.length, 4)] ?? ""}`}>
        {group.items.map((item, i) => {
          const chosen = isSelected(item.id);
          const band = TIER_BAND[item.name.trim().toLowerCase()] ?? FLARE_BAND;
          return (
            <li
              key={item.id}
              data-hot={item.highlighted ? "1" : "0"}
              data-chosen={chosen ? "1" : "0"}
              className="hl-pass hl-rise flex flex-col p-6 pt-12"
              style={{ "--d": `${i * 120}ms` } as React.CSSProperties}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
            >
              <span aria-hidden className="absolute inset-x-0 top-[38px] h-1.5" style={{ background: band }} />
              {item.highlighted && item.badge ? (
                <span className="hl-sticker absolute right-4 top-14 rotate-[8deg]">★ {item.badge}</span>
              ) : null}
              <p className="font-mono text-[0.75rem] uppercase tracking-[0.2em] text-[var(--text-secondary)]">All access</p>
              <p className="hl-display mt-2 text-[clamp(3.25rem,14vw,4.5rem)]">{item.name}</p>
              <p className="hl-em mt-1 text-[1.6rem] leading-tight">{priceLabel(item.price, "cards")}</p>
              {!item.highlighted && item.badge ? (
                <span className="mt-3 self-start rounded-full border border-[var(--hl-volt)] px-3 py-1 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-[var(--hl-volt)]">
                  {item.badge}
                </span>
              ) : null}
              <ul className="mt-6 flex-1 space-y-2.5 border-t border-dashed border-white/20 pt-5">
                {item.features.map((feature, k) => (
                  <li key={k} className="flex gap-3 text-[var(--text-primary)]">
                    <span aria-hidden className="text-[var(--accent-gold-bright)]">
                      +
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div aria-hidden className="mt-6">
                <div className="hl-barcode" />
                <p className="mt-1.5 flex justify-between font-mono text-[0.75rem] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                  <span>N° {String(i + 1).padStart(3, "0")}</span>
                  <span>Zack Production</span>
                </p>
              </div>
              <a
                href="#contact"
                data-sfx="none"
                aria-label={chosen ? `${item.name} selected, continue to booking` : `Choose the ${item.name} package`}
                onClick={() => {
                  if (!chosen) sfx.select(true);
                  planSelection.select(toSelected(item, group));
                }}
                className={`${chosen || item.highlighted ? "hl-btn" : "hl-btn-ghost"} mt-6 w-full`}
              >
                {chosen ? "Selected ✓" : "Choose"}
              </a>
            </li>
          );
        })}
      </InView>
    </div>
  );
}

// Everything else as a club-menu price list: tap a line to add it.
function Menu({ group, isSelected }: { group: PricingGroup; isSelected: (id: string) => boolean }) {
  return (
    <div>
      <h3 className="hl-label">{group.name}</h3>
      <ul className="mt-3 border-t border-[var(--border-subtle)]">
        {group.items.map((item) => {
          const chosen = isSelected(item.id);
          return (
            <li key={item.id} className="border-b border-[var(--border-subtle)]">
              <button
                type="button"
                aria-pressed={chosen}
                data-sfx="none"
                onClick={() => {
                  sfx.select(!chosen);
                  planSelection.toggle(toSelected(item, group));
                }}
                className="group flex min-h-14 w-full items-center gap-3 py-3 text-left"
              >
                <span
                  aria-hidden
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm leading-none transition ${
                    chosen
                      ? "border-[var(--hl-volt)] bg-[var(--hl-volt)] text-[var(--hl-ink)]"
                      : "border-white/30 text-[var(--text-secondary)] group-hover:rotate-90 group-hover:border-[var(--accent-gold)]"
                  }`}
                >
                  {chosen ? "✓" : "+"}
                </span>
                <span className={`text-[1.05rem] ${chosen || item.highlighted ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"} group-hover:text-[var(--text-primary)]`}>
                  {item.name}
                  {item.badge ? (
                    <span className="ml-2 inline-block rounded-full border border-[var(--hl-volt)] px-2 py-0.5 align-middle font-mono text-[0.75rem] uppercase tracking-[0.1em] text-[var(--hl-volt)]">
                      {item.badge}
                    </span>
                  ) : null}
                </span>
                <span aria-hidden className="mx-1 hidden h-px flex-1 translate-y-1 border-b border-dotted border-white/25 sm:block" />
                <span
                  className={`ml-auto shrink-0 tabular-nums ${
                    item.price.trim() ? "hl-display text-[1.6rem] text-[var(--accent-gold-bright)]" : "text-[0.9rem] italic text-[var(--text-secondary)]"
                  }`}
                >
                  {priceLabel(item.price, "list")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
