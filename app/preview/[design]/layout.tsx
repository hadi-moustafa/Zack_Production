import { notFound } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import { isDesign } from "@/lib/design";

// /preview/<design>: the home page in a chosen design, whatever is live, so
// the owner can compare before switching in Admin → Design.
export default async function PreviewLayout({ children, params }: { children: React.ReactNode; params: Promise<{ design: string }> }) {
  const { design } = await params;
  if (!isDesign(design)) notFound();
  return <SiteChrome design={design}>{children}</SiteChrome>;
}
