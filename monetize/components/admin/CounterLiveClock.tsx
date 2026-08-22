"use client";

import { useEffect, useState } from "react";

const ZONES = [
  { tz: "America/Los_Angeles", label: "Pacific" },
  { tz: "America/Chicago", label: "Central" },
  { tz: "America/New_York", label: "Eastern" },
] as const;

function formatZone(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(now);
}

export function CounterLiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) {
    return <span>updated hourly</span>;
  }

  const clocks = ZONES.map((z) => `${formatZone(now, z.tz)} ${z.label}`).join(
    " · "
  );
  return (
    <span>
      updated hourly · {clocks}
    </span>
  );
}
