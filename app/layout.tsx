import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, DM_Mono, Caveat } from "next/font/google";
import SoundProvider from "@/components/sound/SoundProvider";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
  style: ["normal", "italic"],
});

const instrument = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Photography",
  description: "Wedding, portrait & event photography — real moments, captured.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrument.variable} ${dmMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg-dark)] text-[var(--text-primary)]">
        <SoundProvider>{children}</SoundProvider>
      </body>
    </html>
  );
}
