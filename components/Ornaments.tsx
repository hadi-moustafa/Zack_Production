/** Small hand-drawn SVG flourishes. Deliberately a little imperfect. */

export function Squiggle({ className = "", center = false }: { className?: string; center?: boolean }) {
  return (
    <svg
      viewBox="0 0 220 14"
      fill="none"
      aria-hidden
      className={`ink-draw mt-3 h-3.5 w-40 text-[var(--accent-gold)] ${center ? "mx-auto" : ""} ${className}`}
    >
      <path
        d="M2 8c14-8 22 6 38 0s22-7 38-1 24 6 40-1 22-6 38 0 22 5 38-1 22-2 26 0"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ScribbleArrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 60" fill="none" aria-hidden className={`ink-draw ${className}`}>
      <path
        d="M4 8C22 4 52 10 62 36c2 6 1 10-1 14M62 50c-6-3-10-8-13-14M62 50c5-5 12-8 20-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ApertureMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={className}>
      <circle cx="24" cy="24" r="19" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1.4" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path
          key={a}
          d="M24 5 L33 20"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          transform={`rotate(${a} 24 24)`}
        />
      ))}
    </svg>
  );
}

export function OrnamentDivider() {
  return (
    <div className="ornament-divider py-6" aria-hidden>
      <ApertureMark className="h-8 w-8 shrink-0" />
    </div>
  );
}
