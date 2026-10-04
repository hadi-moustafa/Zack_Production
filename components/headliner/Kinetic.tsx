// Server-rendered building blocks for the Headliner's kinetic type. The text
// is plain HTML (readable without JavaScript); an ancestor <InView> starts
// the animation.

/** Each word slides up out of its own line, one after another. */
export function SplitWords({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span className={`hl-words ${className}`} style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      {words.map((word, i) => (
        <span key={i}>
          <span className="w">
            <span style={{ "--i": i } as React.CSSProperties}>{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

/** "02 / Who we are" */
export function Kicker({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="hl-kicker">
      <span className="n">{n}</span>
      <span className="hl-label">{children}</span>
    </p>
  );
}

/** Words of a name split into two halves, for stacking on tall screens. */
export function splitHalves(word: string): [string, string] {
  const mid = Math.ceil(word.length / 2);
  return [word.slice(0, mid), word.slice(mid)];
}
