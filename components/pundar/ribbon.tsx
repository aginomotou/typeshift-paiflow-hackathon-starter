import type { CSSProperties } from "react";
import { SHARES } from "@/lib/pundar-split";

// The 60 / 15 / 25 "padala ribbon": PUNDAR's signature mark.
export function Ribbon({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={`ribbon ribbon-${size}`}
      role="img"
      aria-label="Plano: 60% pang-bahay, 15% baon sa eskwela, 25% ipon ng OFW"
    >
      {SHARES.map((s, i) => (
        <span
          key={s.key}
          className={`seg-${s.key}`}
          style={{ flexGrow: s.bps, "--i": i } as CSSProperties}
        />
      ))}
    </div>
  );
}
