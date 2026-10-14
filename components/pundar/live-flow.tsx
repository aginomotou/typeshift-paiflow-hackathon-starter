"use client";
import { formatUsdc } from "@/lib/format";
import { MIN_PADALA_STROOPS, SHARES } from "@/lib/pundar-split";
import { QrCode } from "@/components/pundar/qr-code";

const MIN_USDC = formatUsdc(MIN_PADALA_STROOPS);

// The deployed flow, drawn from the same plan the contracts use, plus a way to
// open Paiflow's live embed (it can't be framed: X-Frame-Options DENY).
export function LiveFlow({ embedUrl }: { embedUrl: string }) {
  return (
    <section className="card live-flow" aria-labelledby="live-flow-title">
      <div className="live-flow-copy">
        <p className="eyebrow">Live sa Paiflow</p>
        <h2 id="live-flow-title" className="h2">
          Ang flow na <em>sumusunod</em> sa plano
        </h2>
        <p className="muted">
          Ito mismo ang naka-deploy sa Stellar testnet. Bawat padala ay dumadaan
          dito, at makikita ang bawat galaw nang live sa Paiflow.
        </p>
        <ol className="flow-steps" aria-label="Ang flow">
          <li>
            <span className="flow-node">Tanggap</span>
            <span className="muted small">On Receive · USDC</span>
          </li>
          <li>
            <span className="flow-node">Kondisyon</span>
            <span className="muted small">Hindi bababa sa {MIN_USDC} USDC?</span>
          </li>
          <li className="flow-branches">
            <div className="flow-branch flow-yes">
              <span className="flow-tag">Oo</span>
              <span className="flow-node">Hati</span>
              <span className="flow-shares">
                {SHARES.map((s) => (
                  <span key={s.key} className={`plan-${s.key}`}>
                    {s.bps / 100}% {s.tl}
                  </span>
                ))}
              </span>
            </div>
            <div className="flow-branch flow-no">
              <span className="flow-tag">Hindi</span>
              <span className="flow-node">Ibinabalik</span>
              <span className="muted small">Buong halaga, walang hati</span>
            </div>
          </li>
        </ol>
        <a className="btn btn-primary" href={embedUrl} target="_blank" rel="noreferrer">
          Panoorin ang live na flow <span className="arrow" aria-hidden>↗</span>
        </a>
      </div>
      <figure className="live-flow-qr">
        <QrCode value={embedUrl} label="QR papunta sa live na flow sa Paiflow" size={168} />
        <figcaption className="muted small">
          I-scan gamit ang camera ng phone (hindi ang wallet) para buksan ang
          live na flow.
        </figcaption>
      </figure>
    </section>
  );
}
