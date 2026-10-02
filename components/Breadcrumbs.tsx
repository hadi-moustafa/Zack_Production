import Link from "next/link";
import { breadcrumbList, jsonLd, type Crumb } from "@/lib/structuredData";

// Visible breadcrumb trail plus matching BreadcrumbList structured data, so
// the two can never drift apart. `crumbs` starts after Home.
export default function Breadcrumbs({ crumbs, structuredData = true }: { crumbs: Crumb[]; structuredData?: boolean }) {
  const all: Crumb[] = [{ name: "Home", path: "/" }, ...crumbs];

  return (
    <>
      {structuredData ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbList(all))} />
      ) : null}
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--text-secondary)]">
        <ol className="flex flex-wrap items-center gap-x-2">
          {all.map((crumb, i) => {
            const last = i === all.length - 1;
            return (
              <li key={crumb.path} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="text-[var(--text-primary)]">
                    {crumb.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={crumb.path}
                      className="inline-flex min-h-11 min-w-11 items-center underline-offset-4 transition hover:text-[var(--accent-gold-bright)] hover:underline"
                    >
                      {crumb.name}
                    </Link>
                    <span aria-hidden className="text-[var(--accent-gold)]">
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
