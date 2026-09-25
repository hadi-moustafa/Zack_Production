/** Small hand-drawn SVG flourishes. Deliberately a little imperfect. */

export function Flourish({ className = "", center = false }: { className?: string; center?: boolean }) {
  return (
    <svg
      viewBox="0 0 160 12"
      fill="none"
      aria-hidden
      className={`mt-4 h-3 w-32 text-[var(--accent-gold)] ${center ? "mx-auto" : ""} ${className}`}
    >
      <path d="M0 6H62M98 6H160" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
      <path d="M80 1L85 6L80 11L75 6Z" fill="currentColor" />
      <circle cx="68" cy="6" r="1.2" fill="currentColor" />
      <circle cx="92" cy="6" r="1.2" fill="currentColor" />
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
