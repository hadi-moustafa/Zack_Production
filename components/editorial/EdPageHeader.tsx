import "@/app/editorial.css";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { Crumb } from "@/lib/structuredData";

// Title block for inner pages in the editorial voice: breadcrumbs, a small
// parenthetical label and the page's single <h1>, clear of the fixed header.
export default function EdPageHeader({
  crumbs,
  crumbsStructuredData = true,
  eyebrow,
  title,
  children,
}: {
  crumbs: Crumb[];
  crumbsStructuredData?: boolean;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="border-b border-[var(--ed-line)] pb-14 pt-28 sm:pb-20 sm:pt-36">
      <div className="ed-wrap">
        <Breadcrumbs crumbs={crumbs} structuredData={crumbsStructuredData} />
        <p className="ed-label mt-10 sm:mt-14">({eyebrow}.)</p>
        <h1 className="ed-display mt-4 max-w-[16ch] text-[clamp(3rem,9vw,8rem)] text-[var(--ed-ink)]">{title}</h1>
        {children ? <div className="max-w-2xl">{children}</div> : null}
      </div>
    </header>
  );
}
