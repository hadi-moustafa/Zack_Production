import "@/app/editorial.css";
import Link from "next/link";

export type EdLinkRow = { href: string; title: string; meta?: string; external?: boolean };

// Next steps as a numbered index: 01  Title ............ meta →
export default function EdLinkList({ rows, className = "" }: { rows: EdLinkRow[]; className?: string }) {
  return (
    <ul className={`border-t border-[var(--ed-line)] ${className}`}>
      {rows.map((r, i) => {
        const inner = (
          <>
            <span className="ed-label">{String(i + 1).padStart(2, "0")}</span>
            <span className="ed-display text-[clamp(1.75rem,4vw,3rem)] leading-tight text-[var(--ed-ink)] transition-transform duration-500 group-hover:translate-x-2">
              {r.title}
            </span>
            <span className="ed-label col-start-2 sm:col-start-auto sm:text-right">
              {r.meta ? `${r.meta} ` : ""}
              {r.external ? "↗" : "→"}
            </span>
          </>
        );
        const className = "group grid min-h-16 grid-cols-[2.5rem_1fr] items-baseline gap-x-3 gap-y-1 py-5 sm:grid-cols-[4rem_1fr_auto]";
        return (
          <li key={r.href} className="border-b border-[var(--ed-line)]">
            {r.external ? (
              <a href={r.href} target="_blank" rel="noopener noreferrer" className={className}>
                {inner}
              </a>
            ) : (
              <Link href={r.href} className={className}>
                {inner}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
