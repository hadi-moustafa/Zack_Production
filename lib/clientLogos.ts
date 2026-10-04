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
