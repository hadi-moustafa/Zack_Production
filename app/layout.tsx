import type { Metadata } from "next";
import { Cormorant_Garamond, Instrument_Sans, DM_Mono } from "next/font/google";
import SoundProvider from "@/components/sound/SoundProvider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

export const metadata: Metadata = {
  title: "Photography",
  description: "Wedding, portrait & event photography — real moments, captured.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${instrument.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg-dark)] text-[var(--text-primary)]">
        <SoundProvider>{children}</SoundProvider>
      </body>
    </html>
  );
}
