import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `About ${site.founder} — ${site.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({ kicker: "Director of Photography", title: `About ${site.founder}` });
}
