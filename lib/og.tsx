import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site, locationLabel } from "@/lib/site";

// One renderer for every page's Open Graph image, so shares look the same
// across the site: the real hero frame on the right, brand + page title left.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const dataUrl = (buf: Buffer, type: string) => `data:${type};base64,${buf.toString("base64")}`;

export async function renderOgImage({ title, kicker }: { title: string; kicker: string }) {
  const [display, body, mono, logo, photo] = await Promise.all([
    // Literal paths so the build only bundles these files.
    readFile(join(process.cwd(), "assets/fonts/CormorantGaramond-MediumItalic.ttf")),
    readFile(join(process.cwd(), "assets/fonts/InstrumentSans-Medium.ttf")),
    readFile(join(process.cwd(), "assets/fonts/DMMono-Medium.ttf")),
    readFile(join(process.cwd(), "public/logo.png")),
    readFile(join(process.cwd(), "assets/og-hero.jpg")),
  ]);

  const gold = "#e8c169";
  const host = new URL(site.url).host;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0a0a0a", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl(photo, "image/jpeg")}
          alt=""
          width={1120}
          height={630}
          style={{ position: "absolute", left: 300, top: 0, width: 1120, height: 630, objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            // Satori has no `inset`; explicit box. Fades the photo into the text side.
            backgroundImage:
              "linear-gradient(90deg, #0a0a0a 0%, #0a0a0a 32%, rgba(10,10,10,0.8) 52%, rgba(10,10,10,0.2) 80%, rgba(10,10,10,0.05) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 28,
            right: 28,
            bottom: 28,
            display: "flex",
            border: "1px solid rgba(201,162,75,0.35)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "70px 80px",
            width: 760,
            height: "100%",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl(logo, "image/png")} alt="" width={322} height={120} style={{ width: 322, height: 120 }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Mono", fontSize: 22, letterSpacing: 5, color: gold, textTransform: "uppercase" }}>
              {kicker}
            </div>
            <div
              style={{
                fontFamily: "Display",
                fontStyle: "italic",
                fontSize: title.length > 28 ? 72 : 92,
                lineHeight: 1.02,
                color: "#f5f2ea",
                marginTop: 18,
              }}
            >
              {title}
            </div>
          </div>
          <div style={{ display: "flex", fontFamily: "Body", fontSize: 24, color: "#c9c4b8" }}>
            {host} · {locationLabel}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Display", data: display, style: "italic", weight: 500 },
        { name: "Body", data: body, style: "normal", weight: 500 },
        { name: "Mono", data: mono, style: "normal", weight: 500 },
      ],
    }
  );
}
