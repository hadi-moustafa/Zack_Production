import logos from "@/lib/clientLogos.json";

/** A client logo made uniform by `npm run logos` (see scripts/logos.mjs). */
export type ClientLogo = {
  name: string;
  /** "elite" logos stand in the front row; "others" sit behind them. */
  tier: "elite" | "others";
  src: string;
  width: number;
  height: number;
  /** Share of the logo's box covered by ink (0–1), to balance light and heavy marks. */
  density: number;
};

export const CLIENT_LOGOS = logos as ClientLogo[];

/**
 * Same visual weight for every logo, as a CSS height relative to --lh. A
 * square mark is drawn taller than a long wordmark (height ∝ aspect^-0.4),
 * and a thin, airy mark a little larger than a heavy solid one (by its ink
 * density), all within limits.
 */
export function logoHeight(logo: ClientLogo) {
  const shape = Math.min(1.1, Math.max(0.4, (logo.width / logo.height) ** -0.4));
  const weight = Math.min(1.2, Math.max(0.85, (0.25 / Math.max(logo.density, 0.01)) ** 0.25));
  return `calc(var(--lh) * ${(shape * weight).toFixed(3)})`;
}

/** The dozen names the Editorial home page leads with; the rest live on /clients. */
const FEATURED_NAMES = [
  "MTV Lebanon",
  "UEFA Euro 2024",
  "YouTube",
  "Carrefour",
  "Al Jadeed Television",
  "OTV",
  "Keune Haircosmetics",
  "Warwick Palm Beach Hotel",
  "One Beirut",
  "Pearl of Beirut Hotel & Spa",
  "KSrelief",
  "Lebanese International University",
];

export const FEATURED_CLIENT_LOGOS = FEATURED_NAMES.map((name) => CLIENT_LOGOS.find((l) => l.name === name)).filter(
  (l): l is ClientLogo => Boolean(l)
);
