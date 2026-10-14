"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

// A QR for a public URL, drawn in Pundar's ink on card paper.
export function QrCode({ value, label, size = 200 }: { value: string; label: string; size?: number }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let stopped = false;
    QRCode.toDataURL(value, {
      margin: 1,
      width: size * 2,
      errorCorrectionLevel: "M",
      color: { dark: "#1d1814", light: "#fffcf7" },
    })
      .then((url) => {
        if (!stopped) setSrc(url);
      })
      .catch(() => {
        if (!stopped) setSrc("");
      });
    return () => {
      stopped = true;
    };
  }, [value, size]);

  return (
    <div className="qr" style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} width={size} height={size} />
      ) : (
        <span className="qr-loading" aria-hidden />
      )}
    </div>
  );
}
