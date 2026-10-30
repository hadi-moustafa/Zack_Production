// A numbered section label: 01 — Who we are
// Pass as="h2" where the label is the section's only heading.
export default function EdLabel({
  n,
  children,
  as: Tag = "p",
}: {
  n?: number;
  children: React.ReactNode;
  as?: "p" | "h2";
}) {
  return (
    <Tag className="ed-label ed-reveal flex flex-wrap items-center gap-x-4 gap-y-1">
      {n ? (
        <span className="ed-label-ink flex items-center gap-4">
          {String(n).padStart(2, "0")}
          <span aria-hidden className="h-px w-8 bg-current opacity-40" />
        </span>
      ) : null}
      <span>{children}</span>
    </Tag>
  );
}
