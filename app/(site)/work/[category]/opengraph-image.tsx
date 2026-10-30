import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getWorkGroups } from "@/lib/workData";

export const alt = "Zack Production — work by category";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return (await getWorkGroups()).map((g) => ({ category: g.category.slug }));
}

export default async function Image({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const group = (await getWorkGroups()).find((g) => g.category.slug === category);
  return renderOgImage({ kicker: "Selected work", title: group?.category.name ?? "Selected Work" });
}
