import type { ReactNode } from "react";

type Tone = "household" | "student" | "savings" | "ink";

// A perforated postage stamp: the padala motif, drawn in CSS (no images).
export function PostageStamp({
  tone = "ink",
  tilt = 0,
  className = "",
  children,
}: {
  tone?: Tone;
  tilt?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`postage-stamp tone-${tone} ${className}`.trim()}
      style={{ rotate: `${tilt}deg` }}
    >
      <div className="postage-frame">{children}</div>
    </div>
  );
}
