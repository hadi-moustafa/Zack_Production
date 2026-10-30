import Image from "next/image";
import InView from "@/components/headliner/InView";
import EdLabel from "@/components/editorial/EdLabel";
import type { Group } from "@/lib/work";

const MIN_ROWS = 3;

// What we do, numbered: one word, one sentence, one image. Built from the
// categories that have a description (Admin → Categories), so nothing is
// invented; with fewer than three it stays hidden.
export default function EdCapabilities({ groups }: { groups: Group[] }) {
  const rows = groups.filter((g) => g.category.description.trim());
  if (rows.length < MIN_ROWS) return null;

  return (
    <section aria-labelledby="ed-capabilities" className="ed-section border-b border-[var(--ed-line)]">
      <div className="ed-wrap">
        <InView>
          <div id="ed-capabilities">
            <EdLabel as="h2">What we do</EdLabel>
          </div>
        </InView>
        <ol className="mt-12 border-t border-[var(--ed-line)] sm:mt-16">
          {rows.map((g, i) => (
            <InView as="li" key={g.category.id} threshold={0.25} className="grid gap-6 border-b border-[var(--ed-line)] py-8 sm:grid-cols-[4rem_1fr_1fr] sm:items-center sm:gap-x-3 lg:grid-cols-[4rem_5fr_5fr_2fr]">
              <span className="ed-label ed-label-ink ed-reveal">[{String(i + 1).padStart(2, "0")}]</span>
              <p className="ed-display ed-reveal text-[clamp(2rem,4vw,3.5rem)]" style={{ "--d": "80ms" } as React.CSSProperties}>
                {g.category.name}.
              </p>
              <p className="ed-body ed-reveal" style={{ "--d": "160ms" } as React.CSSProperties}>
                {g.category.description}
              </p>
              {g.cover?.still ? (
                <div className="ed-cap-img relative aspect-[4/5] w-24 bg-[var(--ed-bg-alt)] sm:col-start-3 lg:col-start-auto lg:w-full">
                  <Image src={g.cover.still} alt="" aria-hidden fill sizes="(min-width: 1024px) 12vw, 96px" placeholder={g.cover.blur ? "blur" : "empty"} blurDataURL={g.cover.blur} className="object-cover" />
                </div>
              ) : null}
            </InView>
          ))}
        </ol>
      </div>
    </section>
  );
}
