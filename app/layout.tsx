import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Instrument_Sans, DM_Mono, Limelight } from "next/font/google";
import SoundProvider from "@/components/sound/SoundProvider";
import { site, baseOpenGraph } from "@/lib/site";
import "./globals.css";

// Headings and italic accents
const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Body copy (and, condensed via its width axis, the Headliner design's display type)
const instrument = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  axes: ["wdth"],
});

// Small uppercase labels
const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Old-Hollywood marquee type for the hero's closing line. It only shows after
// scrolling, so it isn't preloaded ahead of the first paint.
const limelight = Limelight({
  variable: "--font-cinematic",
  subsets: ["latin"],
  weight: "400",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Photography & Videography in Beirut, Lebanon`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.founder }],
  creator: site.name,
  openGraph: baseOpenGraph,
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: site.theme.background,
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${instrument.variable} ${dmMono.variable} ${limelight.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--bg-dark)] text-[var(--text-primary)]">
        <noscript>
          <style>{`.reveal,.hl-rise,.hl-slam,.hl-wipe,.hl-words .w>span{opacity:1!important;transform:none!important;filter:none!important;clip-path:none!important}`}</style>
        </noscript>
        <SoundProvider>{children}</SoundProvider>
      </body>
    </html>
  );
}
