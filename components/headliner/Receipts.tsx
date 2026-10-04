import InView from "@/components/headliner/InView";
import CountUp from "@/components/headliner/CountUp";
import { Kicker, SplitWords } from "@/components/headliner/Kinetic";

export type Stat = { value: string; label: string };

// The big numbers: the admin's own lines first, then real counts from the gallery.
export default function Receipts({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;
  return (
    <section aria-labelledby="receipts-title" className="relative overflow-hidden bg-[var(--bg-dark)] py-20 sm:py-28">
      <InView className="mx-auto max-w-7xl px-5 sm:px-8">
        <Kicker n="01">By the numbers</Kicker>
        <h2 id="receipts-title" className="hl-display mt-5 text-[clamp(3.2rem,15vw,9rem)]">
          <SplitWords text="The" /> <span className="hl-em">receipts.</span>
        </h2>
        <p className="hl-rise mt-4 max-w-md text-[1.05rem] text-[var(--text-secondary)]" style={{ "--d": "200ms" } as React.CSSProperties}>
          We don&apos;t do modest. We do numbers.
        </p>
        <dl className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 min-[400px]:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="hl-rise flex flex-col-reverse border-t border-[var(--border-subtle)] pt-4"
              style={{ "--d": `${150 + i * 120}ms` } as React.CSSProperties}
            >
              <dt className="hl-label mt-2">{s.label}</dt>
              <dd className="hl-display hl-stat-num text-[clamp(4.5rem,22vw,8.5rem)]">
                <CountUp value={s.value} />
              </dd>
            </div>
          ))}
        </dl>
      </InView>
    </section>
  );
}
