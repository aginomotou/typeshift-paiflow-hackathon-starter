"use client";
import { useEffect, useState } from "react";
import type { EventItem, EventPage, LockedPublic } from "@/lib/paiflow";
import { browserRequest } from "@/lib/browser-api";
import { toStroops } from "@/lib/amount";
import { formatUsdc, shortAddress, txLink } from "@/lib/format";
import { SHARES, expectedSplit } from "@/lib/pundar-split";
import { useWalletOperation } from "@/lib/hooks/use-wallet-operation";
import { shortDeployment, tokenHint } from "@/lib/token-hint";

const ROUTES = { pay: "/api/locked/pay", integration: "/api/locked/integration" };
const QUICK = ["30", "50", "100"];

type Row = {
  txHash: string;
  ledger: number;
  occurredAt: string;
  deposit: string | null;
  paidOut: boolean;
};

// Group the locked deployment's events per transaction. Before the unlock
// time a deposit has no payout (held by Hold). The timed unlock is its own
// transaction with payout events and no deposit.
function rows(events: EventItem[]): Row[] {
  const byTx = new Map<string, EventItem[]>();
  for (const e of events) byTx.set(e.txHash, [...(byTx.get(e.txHash) ?? []), e]);
  return [...byTx.entries()]
    .map(([txHash, list]) => {
      const dep = list.find((e) => e.topic === "deposit")?.data as
        | { amount?: unknown }
        | undefined;
      const amount = typeof dep?.amount === "string" && /^\d+$/.test(dep.amount)
        ? dep.amount
        : null;
      return {
        txHash,
        ledger: Math.max(...list.map((e) => e.ledger)),
        occurredAt: list[0]?.occurredAt ?? "",
        deposit: amount,
        paidOut: list.some((e) => e.topic === "payout"),
      };
    })
    .sort((a, b) => b.ledger - a.ledger);
}

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  });

// Locked padala (#5): On Receive → Condition time_after → before: Hold,
// after: Split 60/15/25 to the 3 family wallets. Deposit now; nobody can move
// it until the unlock time, then it splits on its own.
export function LockedPadala({
  locked,
  address,
  enabled,
}: {
  locked: NonNullable<LockedPublic>;
  address: string;
  enabled: boolean;
}) {
  const [amount, setAmount] = useState("50");
  const [error, setError] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  // Setup problem with THIS deployment's token (shown in plain words).
  const [setupError, setSetupError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const workflow = useWalletOperation(
    `team:locked:${locked.deploymentUrl}`,
    enabled,
    ROUTES,
  );
  const unlockAt = Date.parse(locked.unlockAt);
  const released = now >= unlockAt;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  // Light polling: Paiflow collects events about every 10 s anyway.
  const resultHash = workflow.result?.txHash;
  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    const load = async () => {
      try {
        const page = await browserRequest<EventPage>("/api/locked/events");
        if (!stopped) {
          setEvents(page.items);
          setSetupError("");
        }
      } catch (e) {
        // Keep the last good list; flag only token/setup problems.
        const hint = tokenHint(
          e instanceof Error ? `${e.name} ${e.message}` : String(e),
          "locked",
          shortDeployment(locked.deploymentUrl),
        );
        if (!stopped && hint) setSetupError(hint);
      }
    };
    void load();
    const t = setInterval(() => {
      if (!document.hidden) void load();
    }, 10_000);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [enabled, resultHash]);

  const list = rows(events);
  const releases = list.filter((r) => !r.deposit && r.paidOut);
  // A deposit made before the latest timed unlock was paid out by it.
  const lastRelease = Math.max(0, ...releases.map((r) => r.ledger));
  const isHeld = (r: Row) => !!r.deposit && !r.paidOut && r.ledger > lastRelease;
  const held = list
    .filter(isHeld)
    .reduce((sum, r) => sum + BigInt(r.deposit!), 0n);
  const preview = (() => {
    try {
      return expectedSplit(toStroops(amount));
    } catch {
      return null;
    }
  })();
  const minutesLeft = Math.max(0, Math.ceil((unlockAt - now) / 60_000));

  async function send() {
    setError("");
    let stroops: string;
    try {
      stroops = toStroops(amount);
    } catch {
      setError("Maglagay ng tamang halaga, hal. 50 o 25.50.");
      return;
    }
    await workflow.start("execute", address, { from: address, amount: stroops });
  }

  const result = workflow.result;
  return (
    <section className="card locked" aria-labelledby="locked-title">
      <div className="airmail" aria-hidden />
      <div className="locked-body">
        <div className="locked-head">
          <div>
            <p className="eyebrow">Naka-lock na padala</p>
            <h2 id="locked-title" className="h2">
              I-lock ngayon, <em>mabubuksan sa takdang oras.</em>
            </h2>
            <p className="muted">
              Naka-lock sa Paiflow ang padala hanggang{" "}
              <strong>{timeLabel(locked.unlockAt)}</strong>. Pagdating ng oras,
              kusang mahahati ito 60 / 15 / 25 sa tatlong wallet ng pamilya.
              Walang makakagalaw dito bago iyon, kahit kami.
            </p>
          </div>
          <div className={`release-clock${released ? " done" : ""}`}>
            <span className="release-label">
              {released ? "Bukas na" : "Mabubuksan sa"}
            </span>
            <span className="display release-value">
              {released ? "Tapos" : minutesLeft >= 60
                ? `${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m`
                : `${minutesLeft} min`}
            </span>
            <span className="small">Naka-lock: {formatUsdc(held.toString())} USDC</span>
          </div>
        </div>

        {setupError && (
          <p className="notice alert" role="alert">{setupError}</p>
        )}

        {released && (
          <p className="notice small" role="status">
            Bukas na ang lock. Ang bagong padala dito ay diretso nang mahahati,
            hindi na mala-lock.
          </p>
        )}

        <form
          className="locked-form"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <label className="amount-field amount-field-sm">
            <span className="visually-hidden">Halaga ng naka-lock na padala sa USDC</span>
            <input
              className="amount-input"
              inputMode="decimal"
              autoComplete="off"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value.trim())}
            />
            <span className="amount-unit">USDC</span>
          </label>
          <div className="chips" role="group" aria-label="Mabilisang halaga">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                className="chip-btn"
                aria-pressed={amount === q}
                onClick={() => setAmount(q)}
              >
                {q}
              </button>
            ))}
          </div>
          {preview && (
            <p className="small muted">
              Pagbukas ng lock:{" "}
              {SHARES.map((s) => `${formatUsdc(preview[s.key])} ${s.tl.toLowerCase()}`).join(" · ")}
            </p>
          )}
          <button
            className="btn btn-primary btn-lg"
            disabled={!enabled || !address || workflow.blocked || !preview || !!setupError}
          >
            {workflow.busy
              ? "Hinihintay ang Freighter…"
              : !address
                ? "Ikonekta muna ang wallet sa itaas"
                : released
                  ? `Ipadala ang ${amount} USDC (diretsong hati)`
                  : `I-lock ang ${amount} USDC`}
          </button>
        </form>

        {error && <p className="notice alert" role="alert">{error}</p>}
        {workflow.message && !result && (
          <p className="notice info" role="status">{workflow.message}</p>
        )}
        {result && (
          <p className={`notice ${result.status === "FAILED" ? "alert" : "info"}`} role="status">
            {result.status === "SUCCESS"
              ? released
                ? "Pumasok ang padala; diretso itong nahati."
                : `Naka-lock na ang padala hanggang ${timeLabel(locked.unlockAt)}.`
              : result.status === "PENDING"
                ? "Pinoproseso pa. Pindutin ang Check again sa ibaba; huwag munang magpadala ulit."
                : "Hindi natuloy ang padala. Hindi gumalaw ang pera."}{" "}
            <a className="link" href={txLink(result.txHash)} target="_blank" rel="noreferrer">
              Resibo ↗
            </a>
          </p>
        )}
        {workflow.recovery && (
          <div className="notice" role="status">
            May naka-lock na padalang hindi pa tapos ({shortAddress(workflow.recovery.address)}).
            Huwag magpadala ng kapalit.{" "}
            <button
              className="btn btn-ghost btn-sm"
              disabled={workflow.busy}
              onClick={() => void workflow.reconcile()}
            >
              Check again
            </button>
          </div>
        )}

        {!!list.length && (
          <ol className="activity locked-activity">
            {list.slice(0, 6).map((r) => (
              <li key={r.txHash} className={isHeld(r) ? "activity-hold" : "activity-ok"}>
                <span className="what">
                  {isHeld(r)
                    ? "Naka-lock"
                    : r.deposit && !r.paidOut
                      ? "Na-lock, bukas na"
                      : r.deposit
                        ? "Diretsong nahati"
                        : "Na-unlock sa pamilya"}
                  {r.deposit && <span className="num"> · {formatUsdc(r.deposit)} USDC</span>}
                </span>
                <a className="link small" href={txLink(r.txHash)} target="_blank" rel="noreferrer">
                  Resibo ↗
                </a>
                <span className="muted small">
                  <span className="outcome-note">
                    {isHeld(r)
                      ? `Mabubuksan ${timeLabel(locked.unlockAt)}`
                      : "60 / 15 / 25 sa pamilya"}
                  </span>{" "}
                  · <time dateTime={r.occurredAt}>{timeLabel(r.occurredAt)}</time>
                </span>
              </li>
            ))}
          </ol>
        )}
        {releases.length === 0 && held > 0n && (
          <p className="small muted">
            Lalabas dito ang resibo ng pag-unlock mga 1–2 minuto pagkalipas ng
            takdang oras.
          </p>
        )}
      </div>
    </section>
  );
}
