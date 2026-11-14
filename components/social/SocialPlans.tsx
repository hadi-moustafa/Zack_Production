"use client";

import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import { priceLabel, type PricingGroup } from "@/lib/pricing";
import { planSelection, usePlanSelection, type SelectedItem } from "@/lib/planSelection";
import type { PricingPackage } from "@/lib/types";

function toSelected(item: PricingPackage, group: PricingGroup): SelectedItem {
  return {
    id: item.id,
    name: item.name,
    group: group.name,
    price: item.price.trim(),
    // Only one plan of a tiered group makes sense at a time.
    exclusive: group.layout === "cards",
  };
}

// "Production: 5 edited reels" → a deliverable tile (5 · edited reels);
// anything else stays a line in the checklist.
const DELIVERABLE = /^\s*[^:]+:\s*(\d+)\s+(.+)$/;

function splitFeatures(features: string[]) {
  const deliverables: { count: string; what: string }[] = [];
  const included: string[] = [];
  for (const f of features) {
    const m = f.match(DELIVERABLE);
    if (m) deliverables.push({ count: m[1], what: m[2] });
    else included.push(f);
  }
  return { deliverables, included };
}

/** "$600" → "$600 / month", unless the admin already wrote a period. */
function monthly(price: string) {
  const p = priceLabel(price, "cards");
  return price.trim() && !/\/|month|mo\b/i.test(price) ? `${p} / month` : p;
}

// The social media plans: tiered plans as rounded "posts" (the recommended one
// wears the story ring), simple price lists as rows. Book now adds the plan to
// the booking request and goes to the contact form on the home page.
export default function SocialPlans({ groups }: { groups: PricingGroup[] }) {
  const selected = usePlanSelection();
  const isSelected = (id: string) => selected.some((s) => s.id === id);
  const socialPicked = selected.filter((s) => groups.some((g) => g.name === s.group));

  return (
    <div className="space-y-14">
      {groups.map((group) => (
        <div key={group.name}>
          {groups.length > 1 ? <h3 className="sm-label mb-5">{group.name}</h3> : null}
          {group.layout === "cards" ? (
            <PlanCards group={group} isSelected={isSelected} />
          ) : (
            <PlanRows group={group} isSelected={isSelected} />
          )}
        </div>
      ))}

      {socialPicked.length > 0 ? (
        <div className="sm-plan flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[var(--text-primary)]">
            <span className="font-semibold">{socialPicked.map((s) => s.name).join(", ")}</span>
            <span className="text-[var(--text-secondary)]"> · in your booking request</span>
          </p>
          <Link href="/#contact" className="btn-gold justify-center whitespace-nowrap">
            Continue to booking <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

const COLUMNS: Record<number, string> = { 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" };

function PlanCards({ group, isSelected }: { group: PricingGroup; isSelected: (id: string) => boolean }) {
  return (
    <ul className={`mx-auto grid max-w-4xl items-stretch gap-6 ${COLUMNS[Math.min(group.items.length, 4)] ?? ""}`}>
      {group.items.map((item) => {
        const chosen = isSelected(item.id);
        const { deliverables, included } = splitFeatures(item.features);
        const card = (
          <article data-chosen={chosen ? "1" : undefined} className="sm-plan relative flex h-full flex-col p-6 sm:p-7">
            <header className="flex items-center gap-3">
              <span aria-hidden className={`${item.highlighted ? "sm-ring" : "bg-[var(--border-subtle)]"} rounded-full p-[2px]`}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--bg-dark-alt)] bg-[var(--bg-dark)] font-serif-display text-lg leading-none text-[var(--text-primary)]">
                  {item.name.trim().charAt(0)}
                </span>
              </span>
              <h3 className="font-serif-display text-[1.75rem] leading-none text-[var(--text-primary)]">{item.name}</h3>
              {item.badge ? (
                <span className="ml-auto rounded-full border border-[var(--accent-gold-bright)]/60 px-3 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent-gold-bright)]">
                  {item.badge}
                </span>
              ) : null}
            </header>

            <p className="mt-6 font-serif-display text-[clamp(2.5rem,10vw,3.25rem)] leading-none text-[var(--text-primary)]">
              {monthly(item.price)}
            </p>

            {deliverables.length ? (
              <ul className="mt-6 grid grid-cols-2 gap-3">
                {deliverables.map((d) => (
                  <li key={d.what} className="sm-stat px-4 py-3">
                    <span className="block font-serif-display text-[2rem] leading-none text-[var(--accent-gold-bright)]">{d.count}</span>
                    <span className="mt-1 block text-base text-[var(--text-secondary)]">{d.what}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {included.length ? (
              <ul className="mt-6 flex-1 space-y-3 text-[var(--text-secondary)]">
                {included.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span aria-hidden className="sm-check">
                      ✓
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1" />
            )}

            <Link
              href="/#contact"
              aria-label={chosen ? `${item.name} plan selected, continue to booking` : `Book the ${item.name} plan`}
              onClick={() => planSelection.select(toSelected(item, group))}
              className={`${chosen || item.highlighted ? "btn-gold" : "btn-ghost"} mt-8 w-full justify-center !rounded-full !px-4`}
            >
              {chosen ? "Selected ✓" : "Book now"}
            </Link>
          </article>
        );
        return (
          <li key={item.id}>
            {item.highlighted ? <div className="sm-ring sm-plan-ring h-full">{card}</div> : card}
          </li>
        );
      })}
    </ul>
  );
}

function PlanRows({ group, isSelected }: { group: PricingGroup; isSelected: (id: string) => boolean }) {
  return (
    <div className="sm-plan mx-auto max-w-3xl px-5 py-3 sm:px-7">
      <ul>
        {group.items.map((item) => {
          const chosen = isSelected(item.id);
          return (
            <li key={item.id} className="border-b border-[var(--border-subtle)] last:border-b-0">
              <button
                type="button"
                aria-pressed={chosen}
                onClick={() => planSelection.toggle(toSelected(item, group))}
                className="flex min-h-14 w-full items-center gap-3 py-3 text-left"
              >
                <span aria-hidden className={`sm-check ${chosen ? "!bg-[var(--accent-gold-bright)] !text-[#0a0a0a]" : ""}`}>
                  {chosen ? "✓" : "+"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-medium text-[var(--text-primary)]">{item.name}</span>
                  {item.description ? <span className="mt-0.5 block text-base text-[var(--text-secondary)]">{item.description}</span> : null}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-[var(--accent-gold-bright)]">{priceLabel(item.price, "list")}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
