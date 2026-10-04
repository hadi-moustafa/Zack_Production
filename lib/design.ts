// The public site can wear one of two designs, picked in Admin → Design and
// stored in page_content under DESIGN_KEY. Everything else (copy, photos,
// prices, contact details) is shared, so switching never loses content.

export const DESIGN_KEY = "site_design";

export const DESIGNS = {
  classic: {
    name: "Classic",
    summary: "Gold on ink, editorial serif, film-strip details. Calm and elegant.",
  },
  headliner: {
    name: "Headliner",
    summary:
      "Loud, kinetic and unapologetic: video inside the name, magenta & volt on black, crossed ticker tapes, VIP-pass pricing, a client wall, sound effects.",
  },
} as const;

export type DesignId = keyof typeof DESIGNS;

export const DESIGN_IDS = Object.keys(DESIGNS) as DesignId[];

export function isDesign(value: unknown): value is DesignId {
  return typeof value === "string" && value in DESIGNS;
}

/** The live design; anything unknown or unset means Classic. */
export function designFrom(content: Record<string, string>): DesignId {
  const value = content[DESIGN_KEY];
  return isDesign(value) ? value : "classic";
}
