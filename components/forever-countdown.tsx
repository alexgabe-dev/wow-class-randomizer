"use client";

import { useEffect, useState } from "react";

// 15:00 PST (UTC−08:00), or November 5 at 00:00 in Budapest.
export const FOREVER_LAUNCH = "2026-11-04T15:00:00-08:00";
const launchTime = Date.parse(FOREVER_LAUNCH);
const units = [
  { label: "nap", seconds: 86400, modulo: Infinity },
  { label: "óra", seconds: 3600, modulo: 24 },
  { label: "perc", seconds: 60, modulo: 60 },
  { label: "mp", seconds: 1, modulo: 60 },
];

export function ForeverCountdown() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const seconds = Math.max(0, Math.ceil((launchTime - Date.now()) / 1000));
      setRemaining(seconds);
      return seconds;
    };
    if (update() === 0) return;
    const interval = window.setInterval(() => {
      if (update() === 0) window.clearInterval(interval);
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className="forever-countdown"
      role="timer"
      aria-live="off"
      aria-label="WoW Forever megjelenéséig hátralévő idő"
      title="Indulás: 2026. november 5. 00:00 (budapesti idő)"
    >
      <span className="countdown-heading">WoW Forever</span>
      {remaining === 0 ? (
        <span className="countdown-launched">Elindult!</span>
      ) : (
        <div className="countdown-digits">
          {units.map(({ label, seconds, modulo }, index) => (
            <div className="countdown-unit" key={label}>
              {index > 0 && (
                <span className="countdown-colon" aria-hidden="true">
                  :
                </span>
              )}
              <span className="countdown-value">
                {remaining === null
                  ? "– –"
                  : String(Math.floor(remaining / seconds) % modulo).padStart(
                      2,
                      "0",
                    )}
              </span>
              <span className="countdown-label">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
