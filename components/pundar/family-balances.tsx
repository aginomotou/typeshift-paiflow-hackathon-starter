"use client";
import type { CSSProperties } from "react";
import { formatUsdc, shortAddress, accountLink } from "@/lib/format";
import {
  SHARES,
  type PundarRecipient,
  type ShareKey,
} from "@/lib/pundar-split";
import type { Balances, Snapshot } from "@/lib/hooks/use-pundar";

const COLOR: Record<ShareKey, string> = {
  household: "var(--clay)",
  student: "var(--saffron)",
  savings: "var(--sea)",
};

// One master container; column widths follow the plan (60 / 15 / 25).
export function FamilyBalances({
  recipients,
  enabled,
  balances,
  error,
  before = null,
  expected = null,
  highlight,
  onRefresh,
}: {
  recipients: PundarRecipient[] | null;
  enabled: boolean;
  balances: Balances | null;
  error: string;
  before?: Snapshot | null;
  expected?: Record<ShareKey, string> | null;
  highlight?: ShareKey;
  onRefresh: () => void;
}) {
  const family: PundarRecipient[] =
    recipients ?? SHARES.map((s) => ({ ...s, address: "" }));
  const live = enabled && !!recipients;

  return (
    <section aria-labelledby="family-title" className="stack">
      <div className="section-head">
        <div>
          <p className="eyebrow">Balanse ng pamilya · USDC</p>
          <h2 id="family-title" className="h2">
            Kung saan <em>napunta</em>
          </h2>
        </div>
        <button className="btn btn-ghost btn-sm" disabled={!live} onClick={onRefresh}>
          I-refresh
        </button>
      </div>
      {error && <p className="notice alert" role="alert">{error}</p>}
      <div className="card family">
        {family.map((r) => {
          const b = balances?.balances.find((x) => x.key === r.key);
          const now = b?.balanceStroops ?? undefined;
          const was = before?.[r.key];
          const delta =
            was !== undefined && now !== undefined
              ? BigInt(now) - BigInt(was)
              : null;
          return (
            <article
              key={r.key}
              className={`member${highlight === r.key ? " me" : ""}`}
              style={{ "--c": COLOR[r.key] } as CSSProperties}
            >
              <div className="member-top">
                <span className="pct">{r.bps / 100}%</span>
                {highlight === r.key && <span className="tag">Ikaw</span>}
              </div>
              <h3>{r.tl}</h3>
              <p className="muted small">{r.who}</p>
              <p
                key={now ?? "none"}
                className={`bal${delta !== null && delta > 0n ? " pop" : ""}`}
              >
                {!live
                  ? "—"
                  : !b
                    ? "…"
                    : b.status === "ok" && now !== undefined
                      ? formatUsdc(now)
                      : b.status === "no_trustline"
                        ? "Walang USDC trustline"
                        : "Hindi pa funded"}
              </p>
              {delta !== null && delta > 0n && (
                <p className="delta">+{formatUsdc(delta.toString())} ngayon</p>
              )}
              {expected && (
                <p className="muted small">
                  Inaasahan: {formatUsdc(expected[r.key])}
                </p>
              )}
              <p className="muted small member-addr">
                {r.address ? (
                  <a className="link" href={accountLink(r.address)} target="_blank" rel="noreferrer">
                    {shortAddress(r.address)}
                  </a>
                ) : (
                  "Wala pang wallet"
                )}
              </p>
            </article>
          );
        })}
      </div>
      <p className="muted small">
        {balances
          ? `Huling basa: ${new Date(balances.readAt).toLocaleTimeString("en-PH")}. `
          : ""}
        Ang resibo (transaction link) ang patunay ng hati; gumagalaw din ang
        balanse kapag may ibang pumasok o lumabas sa wallet.
      </p>
    </section>
  );
}
