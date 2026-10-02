import Breadcrumbs from "@/components/Breadcrumbs";
import { Flourish } from "@/components/Ornaments";
import type { Crumb } from "@/lib/structuredData";

// Title block for inner pages: clears the fixed nav, shows breadcrumbs and
// the page's single <h1>.
export default function PageHeader({
  crumbs,
  crumbsStructuredData = true,
  eyebrow,
  title,
  children,
}: {
  crumbs: Crumb[];
  /** Off for the 404, whose own URL isn't a real page to point search engines at. */
  crumbsStructuredData?: boolean;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-dark-alt)] pb-12 pt-32 sm:pb-16 sm:pt-40">
      <div className="mx-auto max-w-3xl px-5 sm:px-10">
        <Breadcrumbs crumbs={crumbs} structuredData={crumbsStructuredData} />
        <p className="eyebrow mt-8">{eyebrow}</p>
        <h1 className="font-serif-display mt-3 text-[clamp(2.5rem,10vw,4.5rem)] font-medium italic leading-[1] text-[var(--text-primary)]">
          {title}
        </h1>
        <Flourish />
        {children}
      </div>
    </header>
  );
}
