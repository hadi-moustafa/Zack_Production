import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Zack Production — Real Moments, Beautifully Told";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({ kicker: "Photography & Film", title: "Real Moments, Beautifully Told" });
}
