import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHomeData } from "@/lib/homeData";
import { DESIGNS, DESIGN_IDS, isDesign } from "@/lib/design";
import { site } from "@/lib/site";
import ClassicHome from "@/components/ClassicHome";
import HeadlinerHome from "@/components/headliner/HeadlinerHome";

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return DESIGN_IDS.map((design) => ({ design }));
}

export async function generateMetadata({ params }: { params: Promise<{ design: string }> }): Promise<Metadata> {
  const { design } = await params;
  const name = isDesign(design) ? DESIGNS[design].name : "Design";
  return {
    title: `${name} design preview`,
    description: `A preview of the ${site.name} home page in the ${name} design.`,
    // Same content as the home page: point search engines there and keep this out of results.
    alternates: { canonical: "/" },
    robots: { index: false, follow: true },
  };
}

export default async function PreviewPage({ params }: { params: Promise<{ design: string }> }) {
  const { design } = await params;
  if (!isDesign(design)) notFound();
  const data = await getHomeData();
  return design === "headliner" ? <HeadlinerHome data={data} /> : <ClassicHome data={data} />;
}
