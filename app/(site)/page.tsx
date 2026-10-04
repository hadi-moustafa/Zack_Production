import type { Metadata } from "next";
import { getHomeData } from "@/lib/homeData";
import { designFrom } from "@/lib/design";
import { site, baseOpenGraph } from "@/lib/site";
import ClassicHome from "@/components/ClassicHome";
import HeadlinerHome from "@/components/headliner/HeadlinerHome";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: `${site.name} | Photography & Videography in Beirut, Lebanon` },
  description: `Wedding, graduation, food and promo photography & film in ${site.location.city}, ${site.location.country}. Real moments, cinematic edits. We reply ${site.responseTime}.`,
  alternates: { canonical: "/" },
  openGraph: { ...baseOpenGraph, url: "/" },
};

export default async function Home() {
  const data = await getHomeData();
  return designFrom(data.siteData.content) === "headliner" ? <HeadlinerHome data={data} /> : <ClassicHome data={data} />;
}
