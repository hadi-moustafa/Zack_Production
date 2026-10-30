// A numbered section label in the parenthetical voice: [01]  (Who we are.)
// Pass as="h2" where the label is the section's only heading.
export default function EdLabel({
  n,
  children,
  after,
  as: Tag = "p",
}: {
  n?: number;
  children: React.ReactNode;
  after?: React.ReactNode;
  as?: "p" | "h2";
}) {
  return (
    <Tag className="ed-label ed-reveal flex flex-wrap gap-x-4 gap-y-1">
      {n ? <span className="ed-label-ink">[{String(n).padStart(2, "0")}]</span> : null}
      <span>({children}.)</span>
      {after}
    </Tag>
  );
}
