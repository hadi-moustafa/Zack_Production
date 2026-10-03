import Image from "next/image";
import { IconPlay } from "@/components/icons";

// A still preview of a video with a play button. Nothing from the video file
// itself is downloaded until the visitor opens it, which keeps the gallery
// fast and Supabase's monthly bandwidth for people actually watching.
export default function VideoTile({
  poster,
  src,
  caption,
  label,
  className = "",
  onOpen,
}: {
  /** Still frame; without one, the browser shows the video's first frame (metadata only). */
  poster?: string;
  src: string;
  caption?: string;
  /** Accessible name, e.g. "Wedding film by Zack Production". */
  label: string;
  className?: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Play: ${label}`}
      className={`group relative overflow-hidden rounded-md bg-neutral-900 ${className}`}
    >
      {poster ? (
        <Image
          src={poster}
          alt=""
          aria-hidden
          fill
          loading="lazy"
          sizes="(min-width: 768px) 25vw, 90vw"
          className="object-cover transition duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <video
          aria-hidden
          src={`${src}#t=0.5`}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:border-[var(--accent-gold-bright)] group-hover:text-[var(--accent-gold-bright)]"
      >
        <IconPlay className="ml-0.5 h-6 w-6" />
      </span>

      {caption ? (
        <span aria-hidden className="absolute bottom-3 left-3 right-3 text-left text-sm font-medium text-white">
          {caption}
        </span>
      ) : null}
    </button>
  );
}
