"use client";

import Link from "next/link";
import type { PricingPackage } from "@/lib/types";
import { IconArrowRight } from "@/components/icons";
import Reveal from "@/components/Reveal";
import { Flourish } from "@/components/Ornaments";
import { groupPricing, priceLabel, type PricingGroup } from "@/lib/pricing";
import { planSelection, usePlanSelection, type SelectedItem } from "@/lib/planSelection";

// Metallic swatch per wedding tier; anything else falls back to gold.
const TIER_SWATCH: Record<string, string> = {
  bronze: "linear-gradient(135deg, #e0a872, #8a5a2b)",
  silver: "linear-gradient(135deg, #f2f2f4, #8d8f97)",
  gold: "linear-gradient(135deg, #f6d98b, #a67f2e)",
  platinum: "linear-gradient(135deg, #ffffff, #b9c3cc)",
};

// Fill the row evenly whatever the number of tiers (3 tiers → 3 columns).
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

export default function Pricing({
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
    <section id="pricing" className="bg-[var(--bg-dark-alt)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="section-index justify-center">
            <span className="num">III</span>
            <span className="line" />
            <span className="eyebrow">Pricing</span>
          </div>
          <h2 className="font-serif-display mt-4 text-[clamp(2.5rem,9vw,4.25rem)] font-medium leading-[1] text-[var(--text-primary)]">
            Packages &amp; Prices
          </h2>
          <Flourish center />
          {description ? (
            <p className="mt-6 text-[1.05rem] leading-relaxed text-[var(--text-secondary)] sm:text-[1.1rem]">
              {description}
            </p>
          ) : null}
          {packageGroups.length > 0 && singleGroups.length > 0 ? (
            <nav aria-label="Pricing parts" className="mt-8 flex justify-center gap-3">
              <a href="#pricing-packages" className="btn-ghost !rounded-full !px-6">
                Packages
              </a>
              <a href="#pricing-singles" className="btn-ghost !rounded-full !px-6">
                Singles
              </a>
            </nav>
          ) : null}
        </Reveal>

        {packageGroups.length > 0 ? (
          <Part id="pricing-packages" numeral="1" title="Packages" intro="Complete coverage, fully planned with you from concept to delivery.">
            {packageGroups.map((group) =>
              group.layout === "cards" ? (
                <CardGroup key={group.name} group={group} isSelected={isSelected} />
              ) : (
                <ListGroup key={group.name} group={group} isSelected={isSelected} />
              )
            )}
          </Part>
        ) : null}

        {singleGroups.length > 0 ? (
          <Part id="pricing-singles" numeral="2" title="Singles" intro="Book one service on its own, or add extras to a package. Tap to add.">
            {/* Balanced columns so groups of different lengths don't leave gaps. */}
            <div className="gap-6 lg:columns-2">
              {singleGroups.map((group) => (
                <div key={group.name} className="mb-6 break-inside-avoid">
                  {group.layout === "cards" ? (
                    <CardGroup group={group} isSelected={isSelected} />
                  ) : (
                    <ListGroup group={group} isSelected={isSelected} />
                  )}
                </div>
              ))}
            </div>
          </Part>
        ) : null}

        {selected.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--accent-gold)]/50 bg-[var(--bg-dark)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3 sm:justify-start">
              <p className="text-[var(--text-primary)]">
                <span className="font-semibold">{selected.length} selected</span>
                <span className="text-[var(--text-secondary)]"> · in your booking request</span>
              </p>
              <button
                type="button"
                onClick={planSelection.clear}
                className="inline-flex min-h-11 items-center px-2 text-[var(--text-secondary)] underline underline-offset-4 hover:text-[var(--text-primary)]"
              >
                Clear
              </button>
            </div>
            <Link href="/#contact" className="btn-gold justify-center whitespace-nowrap">
              Continue to booking <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}

        {paymentNote ? (
          <div className="mt-10 border-t border-[var(--border-subtle)] pt-6 text-center">
            <p className="eyebrow">Payment</p>
            <p className="mx-auto mt-2 max-w-xl whitespace-pre-line text-[0.95rem] leading-relaxed text-[var(--text-secondary)]">
              {paymentNote}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Part({
  id,
  numeral,
  title,
  intro,
  children,
}: {
  id: string;
  numeral: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="mt-16 scroll-mt-24 sm:mt-20">
      <div className="flex items-baseline gap-4 border-b border-[var(--border-subtle)] pb-4">
        <span aria-hidden className="font-serif-display text-4xl italic text-[var(--accent-gold)]">
          {numeral}
        </span>
        <div>
          <h3 className="font-serif-display text-[clamp(2rem,7vw,2.75rem)] font-medium leading-none text-[var(--text-primary)]">
            {title}
          </h3>
          <p className="mt-2 text-[var(--text-secondary)]">{intro}</p>
        </div>
      </div>
      <div className="mt-8 space-y-10">{children}</div>
    </div>
  );
}

function CardGroup({ group, isSelected }: { group: PricingGroup; isSelected: (id: string) => boolean }) {
  return (
    <div>
      <h4 className="eyebrow">{group.name}</h4>
      <ul className={`mt-4 grid gap-4 sm:grid-cols-2 sm:pt-3 ${CARD_COLUMNS[Math.min(group.items.length, 4)] ?? ""}`}>
        {group.items.map((item) => {
          const chosen = isSelected(item.id);
          const swatch = TIER_SWATCH[item.name.trim().toLowerCase()] ?? TIER_SWATCH.gold;
          return (
            <li
              key={item.id}
              className={`relative flex flex-col rounded-xl bg-[var(--bg-dark)] p-6 transition-colors ${
                item.highlighted
                  ? "mt-3 border-2 border-[var(--accent-gold-bright)] bg-gradient-to-b from-[#1d170a] to-[var(--bg-dark)] shadow-[0_25px_60px_-25px_rgba(232,193,105,0.55)] sm:mt-0"
                  : chosen
                    ? "border border-[var(--accent-gold-bright)]"
                    : "border border-[var(--border-subtle)]"
              }`}
            >
              {item.highlighted && item.badge ? (
                <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--accent-gold-bright)] px-4 py-1 text-[0.75rem] font-bold uppercase tracking-[0.16em] text-[#0a0a0a] shadow-[0_6px_18px_-6px_rgba(232,193,105,0.8)]">
                  <span aria-hidden>★</span> {item.badge}
                </span>
              ) : null}
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-4 w-4 shrink-0 rounded-full" style={{ background: swatch }} />
                <p className="font-serif-display text-[1.75rem] font-semibold leading-none text-[var(--text-primary)]">
                  {item.name}
                </p>
              </div>
              <p className="mt-2 font-serif-display text-xl italic text-[var(--accent-gold-bright)]">
                {priceLabel(item.price, "cards")}
              </p>
              {!item.highlighted && item.badge ? <OfferBadge text={item.badge} className="mt-3 self-start" /> : null}
              <ul className="mt-5 flex-1 space-y-2.5 border-t border-[var(--border-subtle)] pt-5 text-[var(--text-secondary)]">
                {item.features.map((feature, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span aria-hidden className="mt-[0.7em] h-px w-2.5 shrink-0 bg-[var(--accent-gold)]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/#contact"
                aria-label={chosen ? `${item.name} selected, continue to booking` : `Choose the ${item.name} package`}
                onClick={() => planSelection.select(toSelected(item, group))}
                className={`${chosen || item.highlighted ? "btn-gold" : "btn-ghost"} mt-6 w-full justify-center !px-4`}
              >
                {chosen ? "Selected ✓" : "Choose"}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ListGroup({ group, isSelected }: { group: PricingGroup; isSelected: (id: string) => boolean }) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-dark)] px-5 pb-2 pt-5 sm:px-6">
      <h4 className="eyebrow">{group.name}</h4>
      <ul className="mt-2">
        {group.items.map((item) => {
          const chosen = isSelected(item.id);
          return (
            <li key={item.id} className="border-b border-[var(--border-subtle)] last:border-b-0">
              <button
                type="button"
                aria-pressed={chosen}
                onClick={() => planSelection.toggle(toSelected(item, group))}
                className="group flex min-h-14 w-full items-center gap-3 py-3 text-left"
              >
                <span
                  aria-hidden
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm leading-none transition ${
                    chosen
                      ? "border-[var(--accent-gold-bright)] bg-[var(--accent-gold-bright)] text-[#0a0a0a]"
                      : "border-white/30 text-[var(--text-secondary)] group-hover:border-[var(--accent-gold)]"
                  }`}
                >
                  {chosen ? "✓" : "+"}
                </span>
                <span className={`flex-1 ${chosen || item.highlighted ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                  {item.name}
                  {item.badge ? <OfferBadge text={item.badge} className="ml-2 align-middle" gold={item.highlighted} /> : null}
                </span>
                <span
                  className={`shrink-0 tabular-nums ${
                    item.price.trim() ? "font-semibold text-[var(--accent-gold-bright)]" : "text-[0.9rem] italic text-[var(--text-secondary)]"
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

// A small label on a price: gold for a recommendation, green for an offer.
function OfferBadge({ text, className = "", gold = false }: { text: string; className?: string; gold?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] ${
        gold
          ? "border-[var(--accent-gold-bright)]/60 bg-[var(--accent-gold)]/15 text-[var(--accent-gold-bright)]"
          : "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
      } ${className}`}
    >
      {text}
    </span>
  );
}
