import Image from "next/image";
import { photoPublicUrl } from "@/lib/media";
import { site } from "@/lib/site";
import InView from "@/components/headliner/InView";
import { Kicker, SplitWords } from "@/components/headliner/Kinetic";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function HlAbout({
  bio,
  photoPath,
  photoCaption,
  name,
  roles,
  award,
  tagline,
}: {
  bio: string;
  photoPath: string | null;
  photoCaption: string;
  name: string;
  roles: string;
  award: string;
  tagline: string;
}) {
  const paragraphs = bio.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const roleList = roles.split(/[·•|]/).map((r) => r.trim()).filter(Boolean);
  const [first, ...rest] = name.trim().split(/\s+/);
  // "Best Director of Photography — Afdal Awards 2025 & 2026" → title + where/when
  const [awardTitle, awardDetail] = award.split(/\s+[—–-]\s+/, 2);
  const lines = tagline.split(/(?<=\.)\s+/).filter(Boolean);

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[var(--bg-dark-alt)] py-20 sm:py-28"
      style={{ "--hl-fill": "var(--bg-dark-alt)" } as React.CSSProperties}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <InView>
        <Kicker n="01">Who we are</Kicker>
        <h2 className="hl-display mt-5 text-[clamp(4.2rem,24vw,14rem)]">
          <SplitWords text={first} />
          {rest.length ? (
            <span className="hl-wipe block hl-outline-text" style={d(250)}>
              {rest.join(" ")}
            </span>
          ) : null}
        </h2>
        </InView>

        <InView threshold={0.1} className="mt-12 grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {photoPath ? (
            <div className="hl-slam relative mx-auto w-full max-w-md" style={d(150)}>
              <div className="hl-duotone relative aspect-[4/5] -rotate-2 overflow-hidden rounded-[6px]">
                <Image
                  src={photoPublicUrl(photoPath)}
                  alt={`${site.founder}, photographer and filmmaker at ${site.name}`}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
              </div>
              {photoCaption ? (
                <p className="hl-sticker absolute -left-1 top-6 rotate-[-8deg] sm:-left-4">{photoCaption}</p>
              ) : null}
              {award ? <Seal text={award} /> : null}
            </div>
          ) : null}

          <div>
            {roleList.length ? (
              <ul className="border-t border-[var(--border-subtle)]">
                {roleList.map((role, i) => (
                  <li
                    key={role}
                    className="hl-rise flex items-baseline gap-4 border-b border-[var(--border-subtle)] py-4"
                    style={d(200 + i * 120)}
                  >
                    <span className="font-mono text-sm text-[var(--accent-gold-bright)]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="hl-display text-[clamp(2rem,8vw,3.75rem)]">{role}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {paragraphs.map((p, i) => (
              <p
                key={i}
                className={`hl-rise ${i === 0 ? "mt-8 text-[1.2rem] text-[var(--text-primary)] sm:text-[1.35rem]" : "mt-5 text-[1.05rem] text-[var(--text-secondary)] sm:text-[1.1rem]"} leading-relaxed`}
                style={d(400 + i * 100)}
              >
                {p}
              </p>
            ))}

            {award ? (
              <div className="hl-rise mt-10 flex items-center gap-4 rounded-2xl bg-[var(--hl-volt)] p-5 text-[var(--hl-ink)]" style={d(500)}>
                <span aria-hidden className="text-4xl leading-none">
                  ★
                </span>
                <p>
                  <span className="hl-display block text-[clamp(1.6rem,6vw,2.25rem)]">{awardTitle}</span>
                  {awardDetail ? <span className="mt-1 block font-mono text-sm uppercase tracking-[0.14em]">{awardDetail}</span> : null}
                </p>
              </div>
            ) : null}
          </div>
        </InView>

        {lines.length ? (
          <InView as="div" className="mt-20 sm:mt-28">
          <p>
            {lines.map((line, i) => (
              <span
                key={line}
                className={`hl-wipe block leading-[1] ${
                  i % 2 ? "hl-em text-[clamp(2.4rem,10vw,6.5rem)]" : "hl-display text-[clamp(2.6rem,11vw,7rem)]"
                } ${i === 1 ? "sm:pl-[12%]" : i === 2 ? "sm:pl-[4%]" : ""}`}
                style={d(i * 180)}
              >
                {line}
              </span>
            ))}
          </p>
          </InView>
        ) : null}
      </div>
    </section>
  );
}

// The award as a rotating seal: its text runs around a circle.
function Seal({ text }: { text: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 200" className="absolute -bottom-10 -right-4 h-36 w-36 sm:-right-10 sm:h-44 sm:w-44">
      <circle cx="100" cy="100" r="98" fill="var(--hl-ink)" />
      <circle cx="100" cy="100" r="66" fill="none" stroke="var(--hl-volt)" strokeWidth="1" />
      <defs>
        <path id="hl-seal-path" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
      </defs>
      <g className="hl-seal" style={{ transformOrigin: "100px 100px" }}>
        <text fill="var(--text-primary)" fontSize="12.5" className="font-mono uppercase" letterSpacing="1">
          <textPath href="#hl-seal-path" textLength="495" lengthAdjust="spacingAndGlyphs">
            {`${text.toUpperCase()} ✦ `}
          </textPath>
        </text>
      </g>
      <text x="100" y="122" textAnchor="middle" fontSize="64" fill="var(--hl-volt)">
        ★
      </text>
    </svg>
  );
}
