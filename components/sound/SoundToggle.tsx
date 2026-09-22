"use client";

import { IconSpeakerOff, IconSpeakerOn } from "@/components/icons";
import { useSound } from "@/components/sound/SoundProvider";

export default function SoundToggle({ className = "" }: { className?: string }) {
  const sound = useSound();
  if (!sound) return null;

  return (
    <button
      type="button"
      data-no-sound
      onClick={sound.toggle}
      aria-label={sound.enabled ? "Mute sound effects" : "Enable sound effects"}
      aria-pressed={sound.enabled}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] transition hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] ${className}`}
    >
      {sound.enabled ? <IconSpeakerOn className="h-4 w-4" /> : <IconSpeakerOff className="h-4 w-4" />}
    </button>
  );
}
