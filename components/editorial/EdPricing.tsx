"use client";

import InView from "@/components/headliner/InView";
import EdLabel from "@/components/editorial/EdLabel";
import { groupPricing, priceLabel, type PricingGroup } from "@/lib/pricing";
import { planSelection, usePlanSelection, type SelectedItem } from "@/lib/planSelection";
import type { PricingPackage } from "@/lib/types";

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

// The rate card as a quiet product row: tiered packages as tall cards,
// simple price lists as rows, and the à la carte extras folded away.
// Choosing anything adds it to the booking request in the contact form.
export default function EdPricing({ packages, description, paymentNote }: { packages: PricingPackage[]; description: string; paymentNote: string }) {
  const selected = usePlanSelection();
  const { packages: packageGroups, singles: singleGroups } = groupPricing(packages);
  if (packageGroups.length === 0 && singleGroups.length === 0) return null;
  const isSelected = (id: string) => selected.some((s) => s.id === id);

  return (
    <section id="pricing" className="ed-section scroll-mt-16">
      <div className="ed-wrap">
        <InView>
          <EdLabel n={4}>Pricing</EdLabel>
          <h2 className="ed-display ed-h2 ed-reveal mt-6" style={{ "--d": "100ms" } as React.CSSProperties}>
            The rate card.
          </h2>
          {description ? (
            <p className="ed-lead ed-reveal mt-6 max-w-xl" style={{ "--d": "200ms" } as React.CSSProperties}>
              {description}
            </p>
          ) : null}
        </InView>

        <div className="mt-14 space-y-16 sm:mt-20 sm:space-y-24">
          {packageGroups.map((group) =>
            group.layout === "cards" ? (
              <Cards key={group.name} group={group} isSelected={isSelected} />
            ) : (
              <List key={group.name} group={group} isSelected={isSelected} />
            )
          )}
        </div>

        {singleGroups.length ? (
          <details className="ed-acc mt-16 border-y border-[var(--ed-line)] sm:mt-24">
            <summary className="flex min-h-16 items-center justify-between gap-4 py-4">
              <span className="ed-display text-[clamp(1.75rem,3.5vw,2.75rem)]">Add-ons &amp; extras</span>
              <span className="flex items-center gap-3">
                <span className="ed-label hidden sm:inline">({singleGroups.map((g) => g.name).join(" · ")})</span>
                <span aria-hidden className="ed-plus" />
              </span>
            </summary>
            <div className="grid gap-x-16 gap-y-12 pb-10 pt-4 lg:grid-cols-2">
              <p className="ed-body lg:col-span-2">Book one service on its own, or add extras to a package. Tap to add.</p>
              {singleGroups.map((group) =>
                group.layout === "cards" ? (
                  <div key={group.name} className="lg:col-span-2">
                    <Cards group={group} isSelected={isSelected} />
                  </div>
                ) : (
                  <List key={group.name} group={group} isSelected={isSelected} />
                )
              )}
            </div>
          </details>
        ) : null}

        {selected.length > 0 ? (
          <div className="mt-8 flex flex-col gap-4 bg-[var(--ed-ink)] p-5 text-[var(--ed-bg)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <p className="flex items-center gap-4">
              <span className="font-mono text-[0.8125rem] uppercase tracking-[0.12em]">
                {selected.length} selected · in your booking request
              </span>
              <button type="button" onClick={() => planSelection.clear()} className="inline-flex min-h-11 items-center underline underline-offset-4 opacity-80 hover:opacity-100">
                Clear
              </button>
            </p>
            <a href="#contact" className="inline-flex min-h-11 items-center font-mono text-[0.8125rem] uppercase tracking-[0.12em] underline-offset-4 hover:underline">
              Continue to booking →
            </a>
          </div>
        ) : null}

        {paymentNote ? (
          <div className="mt-14 border-t border-[var(--ed-line)] pt-6">
            <p className="ed-label">Payment</p>
            <p className="ed-body mt-2 whitespace-pre-line">{paymentNote}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

// Tiered packages: tall cards, stacked on a phone and side by side from a tablet up.
function Cards({ group, isSelected }: { group: PricingGroup; isSelected: (id: string) => boolean }) {
  return (
    <div>
      <h3 className="ed-label ed-label-ink">{group.name}</h3>
      <InView
        as="ul"
        threshold={0.1}
        className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5"
      >
        {group.items.map((item, i) => {
          const chosen = isSelected(item.id);
          return (
            <li
              key={item.id}
              className={`ed-reveal flex flex-col bg-[var(--ed-bg-alt)] p-6 sm:p-8 ${
                item.highlighted ? "border-t-2 border-[var(--ed-accent)]" : "border-t-2 border-transparent"
              } ${chosen ? "outline outline-1 -outline-offset-1 outline-[var(--ed-ink)]" : ""}`}
              style={{ "--d": `${i * 100}ms` } as React.CSSProperties}
            >
              {/* Without a badge the line is kept side by side, so the names line up. */}
              {item.badge ? (
                <p className="ed-label ed-label-ink mb-4">{item.badge}</p>
              ) : (
                <p aria-hidden className="ed-label mb-4 hidden md:block">&nbsp;</p>
              )}
              <p className="ed-display text-[clamp(2.5rem,5vw,3.75rem)]">{item.name}</p>
              <p className="ed-label ed-label-ink mt-3">{priceLabel(item.price, "cards")}</p>
              <ul className="mt-8 flex-1 border-t border-[var(--ed-line)]">
                {item.features.map((feature, k) => (
                  <li key={k} className="border-b border-[var(--ed-line)] py-2.5 text-[1rem] text-[var(--ed-ink-soft)]">
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                onClick={() => planSelection.select(toSelected(item, group))}
                aria-label={chosen ? `${item.name} selected, continue to booking` : `Choose the ${item.name} package`}
                className="ed-link mt-8 self-start"
              >
                {chosen ? "Selected ✓ Continue →" : "Choose →"}
              </a>
            </li>
          );
        })}
      </InView>
    </div>
  );
}

// A simple price list: tap a line to add it, tap again to remove it.
function List({ group, isSelected }: { group: PricingGroup; isSelected: (id: string) => boolean }) {
  return (
    <div>
      <h3 className="ed-label ed-label-ink">{group.name}</h3>
      <ul className="mt-4 border-t border-[var(--ed-line)]">
        {group.items.map((item) => {
          const chosen = isSelected(item.id);
          return (
            <li key={item.id} className="border-b border-[var(--ed-line)]">
              <button
                type="button"
                aria-pressed={chosen}
                onClick={() => planSelection.toggle(toSelected(item, group))}
                className="group flex min-h-14 w-full items-center gap-4 py-3 text-left"
              >
                <span aria-hidden className={`w-4 shrink-0 font-mono text-sm ${chosen ? "text-[var(--ed-ink)]" : "text-[var(--ed-ink-soft)]"}`}>
                  {chosen ? "✓" : "+"}
                </span>
                <span className={`flex-1 text-[1.0625rem] ${chosen ? "text-[var(--ed-ink)]" : "text-[var(--ed-ink-soft)] group-hover:text-[var(--ed-ink)]"}`}>
                  {item.name}
                  {item.badge ? <span className="ed-label ed-label-ink ml-2">— {item.badge}</span> : null}
                </span>
                <span className={`shrink-0 tabular-nums ${item.price.trim() ? "ed-display text-[1.5rem] text-[var(--ed-ink)]" : "ed-label"}`}>
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
