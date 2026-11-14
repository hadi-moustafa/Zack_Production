import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `Social Media Management — ${site.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({ kicker: "Monthly plans", title: "Social Media Management" });
}
