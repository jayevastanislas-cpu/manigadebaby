"use client";

import type { ReactNode } from "react";

export function Ticker({
  items,
  speed = "normal",
  className = "",
}: {
  items: ReactNode[];
  speed?: "normal" | "slow";
  className?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div className={`relative flex overflow-hidden ${className}`}>
      <div
        className={`flex w-max shrink-0 items-center ${
          speed === "slow" ? "animate-marquee-slow" : "animate-marquee"
        }`}
      >
        {doubled.map((item, index) => (
          <span key={index} className="flex items-center whitespace-nowrap">
            {item}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink-950 to-transparent" />
    </div>
  );
}
