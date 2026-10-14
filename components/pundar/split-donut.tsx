"use client";
import { useState, type CSSProperties } from "react";
import { SHARES, expectedSplit, type ShareKey } from "@/lib/pundar-split";
import { formatUsdc } from "@/lib/format";

// Sample remittance for the illustration: 100 USDC through the real split.
const SAMPLE = expectedSplit("1000000000");
const R = 92;
const C = 2 * Math.PI * R;
const GAP = 3; // surface gap between slices, in px of arc

// The plan as a donut. Hover or focus a slice or legend row to read it in
// the centre; the legend is the text equivalent, so nothing is colour-only.
export function SplitDonut() {
  const [active, setActive] = useState<ShareKey | null>(null);
  const current = SHARES.find((s) => s.key === active);
  let start = 0;

  return (
    <div className="donut-wrap" onMouseLeave={() => setActive(null)}>
      <figure className="donut">
        <svg viewBox="0 0 240 240" aria-hidden>
          <circle className="donut-track" cx="120" cy="120" r={R} />
          {SHARES.map((s, i) => {
            const len = (C * s.bps) / 10_000;
            const style = {
              "--len": `${len - GAP}`,
              "--c": `var(--${s.key === "household" ? "clay" : s.key === "student" ? "saffron" : "sea"})`,
              "--i": i,
              strokeDashoffset: -start,
            } as CSSProperties;
            start += len;
            return (
              <circle
                key={s.key}
                className={`donut-slice${active && active !== s.key ? " dim" : ""}`}
                cx="120"
                cy="120"
                r={R}
                style={style}
                onMouseEnter={() => setActive(s.key)}
              />
            );
          })}
        </svg>
        <figcaption className="donut-center" aria-live="polite">
          {current ? (
            <>
              <span className="donut-pct">{current.bps / 100}%</span>
              <span className="donut-label">{current.tl}</span>
              <span className="donut-sub num">
                {formatUsdc(SAMPLE[current.key])} USDC
              </span>
            </>
          ) : (
            <>
              <span className="donut-pct">100</span>
              <span className="donut-label">USDC na padala</span>
              <span className="donut-sub">halimbawa</span>
            </>
          )}
        </figcaption>
      </figure>

      <ul className="donut-legend">
        {SHARES.map((s) => (
          <li key={s.key}>
            <button
              type="button"
              className={`legend-row plan-${s.key}${active === s.key ? " on" : ""}`}
              onMouseEnter={() => setActive(s.key)}
              onFocus={() => setActive(s.key)}
              onBlur={() => setActive(null)}
            >
              <span className="legend-pct display">{s.bps / 100}%</span>
              <span className="legend-text">
                <strong>{s.tl}</strong>
                <span className="muted small block">{s.who}</span>
                <span className="small block">{s.note}</span>
              </span>
              <span className="legend-amt num">
                {formatUsdc(SAMPLE[s.key])}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
