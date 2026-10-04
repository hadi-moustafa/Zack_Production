// Two crossed ticker tapes of bragging rights, scrolling in opposite
// directions. The second copy of each track exists only to make the loop
// seamless, so it's hidden from screen readers.

function Track({ items, reverse, speed }: { items: string[]; reverse?: boolean; speed: string }) {
  // Repeat short lists so one copy is always wider than the screen.
  const run = Array.from({ length: Math.max(1, Math.ceil(10 / items.length)) }, () => items).flat();
  const copy = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {run.map((item, i) => (
        <li key={i} className="flex items-center whitespace-nowrap">
          <span className="hl-display px-5 text-[clamp(1.6rem,6vw,2.75rem)] leading-none">{item}</span>
          <span aria-hidden className="text-[1.4rem]">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="hl-tape-track" data-reverse={reverse ? "" : undefined} style={{ "--speed": speed } as React.CSSProperties}>
      {copy(false)}
      {copy(true)}
    </div>
  );
}

export default function Ticker({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const half = Math.ceil(items.length / 2);
  const second = items.length > 1 ? [...items.slice(half), ...items.slice(0, half)] : items;
  return (
    <section aria-label="Highlights" className="relative z-10 overflow-hidden bg-[var(--bg-dark)] py-14 sm:py-20">
      <div className="hl-tape -rotate-3 bg-[var(--hl-volt)] text-[var(--hl-ink)]">
        <Track items={items} speed="45s" />
      </div>
      <div aria-hidden className="hl-tape -mt-6 rotate-2 bg-[var(--accent-gold)] text-[var(--hl-ink)] sm:-mt-8">
        <Track items={second} reverse speed="55s" />
      </div>
    </section>
  );
}
