"use client";

import { useSyncExternalStore } from "react";

const formats = {
  seconds: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Beirut", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
  minutes: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Beirut", hour: "2-digit", minute: "2-digit", hour12: false }),
};

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => clearInterval(id);
}

/** Live local time in Beirut, ticking every second (dashes until hydrated). */
export default function BeirutClock({ seconds = true }: { seconds?: boolean }) {
  const time = useSyncExternalStore(
    subscribe,
    () => (seconds ? formats.seconds : formats.minutes).format(Math.floor(Date.now() / 1000) * 1000),
    () => (seconds ? "--:--:--" : "--:--")
  );
  return <span className="tabular-nums">{time}</span>;
}
