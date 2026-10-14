"use client";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { EventPage, PublicConfig } from "@/lib/paiflow";
import { browserRequest } from "@/lib/browser-api";
import {
  readPadala,
  returnedReason,
  returnedTitle,
  type PadalaOutcome,
} from "@/lib/pundar-activity";
import { Toast, type ToastMessage } from "@/components/pundar/toast";
import { QrCode } from "@/components/pundar/qr-code";
import { hostedLinks, triggerWithAmount } from "@/lib/pundar-links";
import { toStroops } from "@/lib/amount";
import { connectWallet, refreshWallet } from "@/lib/wallet";
import { useWalletOperation } from "@/lib/hooks/use-wallet-operation";
import { useActivity } from "@/lib/hooks/use-activity";
import {
  snapshot,
  useBalances,
  useDiscovery,
  type Snapshot,
} from "@/lib/hooks/use-pundar";
import {
  MIN_PADALA_STROOPS,
  SHARES,
  expectedSplit,
  type PundarRecipient,
} from "@/lib/pundar-split";
import { formatUsdc, shortAddress, txLink } from "@/lib/format";
import { useProfile } from "@/lib/profile";
import { Ribbon } from "@/components/pundar/ribbon";
import { FamilyBalances } from "@/components/pundar/family-balances";
import { ActivityList } from "@/components/pundar/activity-list";

const QUICK = ["50", "100", "200"];
const MIN_USDC = formatUsdc(MIN_PADALA_STROOPS);

// The OFW's send screen. Payment path: browser → /api/pay → Paiflow →
// Freighter signature → /api/pay submit. Recovery logic lives in the hook.
export function StarterApp({
  config,
  recipients = null,
}: {
  config: PublicConfig;
  recipients?: PundarRecipient[] | null;
}) {
  const enabled = config.mode === "demo" || config.mode === "team";
  const { profile } = useProfile();
  const firstName = profile?.name?.split(" ")[0];
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("100");
  const [error, setError] = useState("");
  const [before, setBefore] = useState<Snapshot | null>(null);
  const [sentStroops, setSentStroops] = useState<string | null>(null);
  const configIdentity = JSON.stringify(config);
  const { discovery, error: discoveryError } = useDiscovery(
    enabled,
    configIdentity,
  );
  const scope = discovery
    ? `${config.mode}:${discovery.platformOrigin}/${discovery.deploymentId}`
    : "unconfigured";
  const workflow = useWalletOperation(scope, enabled && !!discovery);
  const activity = useActivity(enabled && !!discovery, scope);
  const family = useBalances(enabled && !!recipients);

  useEffect(() => {
    if (!enabled) return;
    setAddress("");
    const refresh = () => {
      void refreshWallet()
        .then(setAddress)
        .catch(() => setAddress(""));
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [enabled, configIdentity]);

  const resultHash = workflow.result?.txHash;
  const resultStatus = workflow.result?.status;
  const loadFamily = family.load;
  useEffect(() => {
    if (resultHash) void loadFamily();
  }, [resultHash, loadFamily]);

  // SUCCESS only means the transaction landed. A padala under the minimum
  // also "succeeds" because the flow pays it back, so read this transaction's
  // events to tell a real split from a refund before celebrating.
  const [outcome, setOutcome] = useState<PadalaOutcome | "checking" | null>(null);
  // Who received a returned padala: the flow's fixed refund wallet.
  const [returnedTo, setReturnedTo] = useState<string | null>(null);
  useEffect(() => {
    setReturnedTo(null);
    if (!resultHash || resultStatus !== "SUCCESS") {
      setOutcome(null);
      return;
    }
    let stopped = false;
    setOutcome("checking");
    void (async () => {
      for (let attempt = 0; attempt < 4 && !stopped; attempt++) {
        try {
          const page = await browserRequest<EventPage>(
            `/api/events?txHash=${resultHash}`,
          );
          const mine = page.items.filter((e) => e.txHash === resultHash);
          if (mine.length) {
            const read = readPadala(mine);
            if (!stopped) {
              setReturnedTo(read.returnedTo);
              setOutcome(read.outcome);
            }
            return;
          }
        } catch {
          // Feed hiccup: try again shortly; the receipt link still works.
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (!stopped) setOutcome("unknown");
    })();
    return () => {
      stopped = true;
    };
  }, [resultHash, resultStatus]);

  // Pop-up once per finished padala: split, returned, or failed.
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const closeToast = useCallback(() => setToast(null), []);
  useEffect(() => {
    if (!resultHash) return;
    const amount = sentStroops ? `${formatUsdc(sentStroops)} USDC` : "Ang padala";
    if (resultStatus === "FAILED")
      setToast({
        id: resultHash,
        tone: "bad",
        title: "Hindi natuloy ang padala",
        body: `${amount} · Hindi gumalaw ang pera. Puwede kang magpadala ulit.`,
      });
    else if (resultStatus === "SUCCESS" && outcome === "split")
      setToast({
        id: resultHash,
        tone: "ok",
        title: "Nahati na ang padala",
        body: `${amount} → 60 / 15 / 25 sa pamilya`,
      });
    else if (resultStatus === "SUCCESS" && outcome === "refunded")
      setToast({
        id: resultHash,
        tone: "back",
        title: returnedTitle({ from: address || null, returnedTo }),
        body: `${amount} · ${returnedReason(sentStroops)}`,
      });
    // sentStroops/address are read at the moment the outcome lands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultHash, resultStatus, outcome, returnedTo]);

  async function connect() {
    try {
      setAddress(await connectWallet());
      setError("");
    } catch (e) {
      setError(
        `Hindi mabuksan ang Freighter. I-install o i-unlock ito, saka subukan ulit. (${String(e)})`,
      );
    }
  }

  async function send() {
    setError("");
    let stroops: string;
    try {
      stroops = toStroops(amount);
    } catch {
      setError("Maglagay ng tamang halaga, hal. 100 o 25.50.");
      return;
    }
    setBefore(snapshot(await family.load()));
    setSentStroops(stroops);
    await workflow.start("execute", address, {
      from: address,
      amount: stroops,
    });
  }

  const usdcFlow =
    discovery?.inputAsset?.kind === "known" &&
    discovery.inputAsset.symbol === "USDC";
  const canPay =
    enabled &&
    !!recipients &&
    usdcFlow &&
    (discovery?.operations.execute.status === "supported" ||
      discovery?.operations.execute.status === "conditional");
  const preview = (() => {
    try {
      return expectedSplit(toStroops(amount));
    } catch {
      return null;
    }
  })();
  const belowMin = (() => {
    try {
      return BigInt(toStroops(amount)) < BigInt(MIN_PADALA_STROOPS);
    } catch {
      return false;
    }
  })();
  const expected = sentStroops ? expectedSplit(sentStroops) : null;
  // Hosted Paiflow payment page for paying from a phone wallet (team mode only).
  const links = hostedLinks(config.deploymentUrl);
  const phoneUrl =
    links && preview ? triggerWithAmount(links.triggerUrl, amount) : null;
  const result = workflow.result;

  return (
    <main className="container dash">
      <div className="dash-head">
        <div>
          <p className="eyebrow">Padala · Testnet</p>
          <h1 className="display h1-dash">
            Kumusta{firstName ? `, ${firstName}` : ""}. <em>Payday na?</em>
          </h1>
          <p className="lead">
            Send once, and Pundar splits it the way your family agreed.
          </p>
        </div>
      </div>

      <div className="stack">
        {config.mode === "prepare" && (
          <p className="notice" role="status">
            Preparation mode — preview lang ito. Naka-off muna ang wallet, padala
            at live feed hanggang mai-set up ang Paiflow flow.
          </p>
        )}
        {config.mode === "disabled" && (
          <p className="notice alert" role="alert">
            Payments unavailable: {config.message}
          </p>
        )}
        {config.mode === "demo" && (
          <p className="notice alert" role="alert">
            Demo mode uses the shared XLM deployment, not PUNDAR&apos;s USDC
            split. Switch to team mode to send a remittance.
          </p>
        )}
        {enabled && !recipients && (
          <p className="notice alert" role="alert">
            Wala pang family wallets. Ilagay ang PUNDAR_HOUSEHOLD_ADDRESS,
            PUNDAR_STUDENT_ADDRESS at PUNDAR_SAVINGS_ADDRESS sa .env.local,
            saka i-restart.
          </p>
        )}
        {discoveryError && (
          <p className="notice alert" role="alert">
            Discovery unavailable: {discoveryError}. Confirm credentials and
            hosted API availability before transacting.
          </p>
        )}
        {discovery && !usdcFlow && (
          <p className="notice alert" role="alert">
            This deployment does not take USDC. Deploy On Receive (USDC) → Split
            and set its UUID in PAIFLOW_DEPLOYMENT_ID.
          </p>
        )}
      </div>

      <div className="card master split-7-5 send-card">
        <div className="airmail" aria-hidden />
        <section className="panel" aria-labelledby="send-title">
          <h2 id="send-title" className="h2 send-title">
            Magpadala
          </h2>
          {enabled && !discovery && !discoveryError && (
            <p className="muted small">
              Checking deployment capabilities…
            </p>
          )}
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <label className="amount-field">
              <span className="visually-hidden">Halaga sa USDC</span>
              <input
                className="amount-input"
                required
                inputMode="decimal"
                autoComplete="off"
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

            <div className="split-preview">
              <Ribbon size="lg" />
              <ul className="split-list">
                {SHARES.map((s, i) => (
                  <li key={s.key} style={{ "--d": i } as CSSProperties} className="rise">
                    <span className={`dot dot-${s.key}`} aria-hidden />
                    <span>
                      <strong>{s.tl}</strong>{" "}
                      <span className="muted small">{s.bps / 100}%</span>
                    </span>
                    <span className="num">
                      {preview ? formatUsdc(preview[s.key]) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="btn btn-primary btn-block btn-lg"
              // No wallet yet: the main button connects it instead of sitting disabled.
              type={enabled && !address ? "button" : "submit"}
              onClick={enabled && !address ? () => void connect() : undefined}
              disabled={
                enabled && !address
                  ? workflow.busy
                  : !canPay || workflow.blocked || !address
              }
            >
              {workflow.busy
                ? "Hinihintay ang Freighter…"
                : enabled && !address
                  ? "Ikonekta muna ang wallet"
                  : belowMin
                    ? `Ipadala pa rin ang ${amount} USDC`
                    : `Ipadala ang ${preview ? amount : "…"} USDC`}
              {!workflow.busy && <span className="arrow" aria-hidden>→</span>}
            </button>
            <p className={belowMin ? "notice small" : "muted small"} role={belowMin ? "status" : undefined}>
              {belowMin
                ? `Mas mababa sa ${MIN_USDC} USDC na minimum ng plano. Susuriin ito ng Paiflow flow at ibabalik ayon sa plano. Walang mahahati.`
                : enabled && !address
                  ? "Ikonekta muna ang Freighter wallet mo para makapagpadala."
                  : "Mag-e-expire ang transaksyon sa loob ng mga 3 minuto pagkapirma."}
            </p>
          </form>
        </section>

        <aside className="panel panel-muted wallet-panel" aria-label="OFW wallet">
          <p className="eyebrow">Ang wallet mo</p>
          <div className="wallet-row">
            <span className={`status-dot${address ? " on" : ""}`} aria-hidden />
            <strong>{address ? shortAddress(address) : "Hindi pa konektado"}</strong>
          </div>
          <p className="muted small">
            Kailangan ng testnet USDC at kaunting XLM para sa fee. Ikaw lang ang
            pipirma sa sarili mong padala — hindi namin nakikita ang secret key
            mo.
          </p>
          <div className="row-actions">
            <button
              className="btn btn-primary"
              disabled={!enabled || workflow.busy}
              onClick={() => void connect()}
            >
              Ikonekta ang Freighter
            </button>
            <button
              className="btn btn-ghost"
              disabled={!enabled || workflow.busy}
              onClick={() =>
                void refreshWallet()
                  .then(setAddress)
                  .catch((e) => setError(String(e)))
              }
            >
              I-refresh
            </button>
          </div>
          <hr className="rule" />
          <p className="small muted">
            Nagpalit ng account sa Freighter? Pindutin ang I-refresh bago
            magpadala.
          </p>
          <Link className="link small" href="/family">
            Tingnan ang view ng pamilya →
          </Link>
          {phoneUrl && (
            <div className="phone-pay">
              <hr className="rule" />
              <p className="eyebrow">Magpadala gamit ang phone</p>
              <div className="phone-pay-body">
                <QrCode
                  value={phoneUrl}
                  label={`QR para magpadala ng ${amount} USDC sa Paiflow payment page`}
                  size={132}
                />
                <div className="small muted stack-sm">
                  <p>
                    I-scan gamit ang <strong>camera ng phone</strong>, hindi ang
                    scanner ng wallet. Web link ito sa payment page ng Paiflow
                    na may <strong>{amount} USDC</strong>; doon ikokonekta ang
                    wallet.
                  </p>
                  <p>
                    Parehong flow: dadaan pa rin sa {MIN_USDC} USDC na minimum
                    at sa 60 / 15 / 25 na hati. Lalabas ang resulta sa
                    Kasaysayan sa ibaba.
                  </p>
                </div>
              </div>
              <a className="link small" href={phoneUrl} target="_blank" rel="noreferrer">
                Buksan ang payment page ↗
              </a>
            </div>
          )}
        </aside>
      </div>

      {profile?.address && address && address !== profile.address && (
        <p className="notice" role="status">
          Ibang wallet ang nakakonekta sa Freighter ({shortAddress(address)}).
          Naka-login ka bilang {shortAddress(profile.address)}.
        </p>
      )}

      {workflow.message && !result && (
        <p className="notice info" role="status">{workflow.message}</p>
      )}
      {error && <p className="notice alert" role="alert">{error}</p>}

      {result && (() => {
        const ok = result.status === "SUCCESS";
        const split = ok && outcome === "split";
        const refunded = ok && outcome === "refunded";
        const tone = split
          ? "ok"
          : refunded
            ? "back"
            : result.status === "PENDING" || outcome === "checking"
              ? "wait"
              : ok
                ? "wait"
                : "bad";
        return (
          <section className={`card result ${tone}`} aria-live="polite">
            {split && (
              <span className="tick" aria-hidden>
                <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </span>
            )}
            <div>
              <h2 className="h2">
                {split
                  ? "Nahati na ang padala."
                  : refunded
                    ? "Ibinalik ang padala."
                    : ok && outcome === "checking"
                      ? "Sinusuri kung nahati…"
                      : ok
                        ? "Pumasok ang transaksyon."
                        : result.status === "PENDING"
                          ? "Pinoproseso pa…"
                          : "Hindi natuloy ang padala."}
              </h2>
              {split && expected && (
                <p className="lead small-lead">
                  {SHARES.map((s) => `${formatUsdc(expected[s.key])} ${s.tl.toLowerCase()}`).join(" · ")}
                </p>
              )}
              {refunded && (
                <>
                  <p className="returned-reason">
                    {returnedReason(sentStroops)}
                  </p>
                  <p>
                    {sentStroops ? `${formatUsdc(sentStroops)} USDC` : "Ang padala"}{" "}
                    ay hindi nahati.{" "}
                    {returnedTo && returnedTo === address
                      ? "Ibinalik ito ng flow sa wallet mo."
                      : returnedTo
                        ? `Ayon sa plano, napunta ito sa ${shortAddress(returnedTo)}, ang wallet na itinakda ng flow para sa mga ibinabalik.`
                        : "Ibinalik ito ng flow."}{" "}
                    Walang nagbago sa mga balanse ng pamilya.
                  </p>
                </>
              )}
              {ok && outcome === "unknown" && (
                <p>
                  Pumasok ito sa Stellar, pero hindi pa namin makita kung
                  nahati. Tingnan ang resibo bago magpadala ulit.
                </p>
              )}
              {result.status === "PENDING" && (
                <p>
                  Baka pumasok pa ito. Pindutin ang &ldquo;Check again&rdquo; sa
                  ibaba — huwag munang magpadala ulit.
                </p>
              )}
              {result.status === "FAILED" && (
                <p>Hindi gumalaw ang padala. Puwede kang magpadala ulit.</p>
              )}
              <a className="btn btn-ghost btn-sm" href={txLink(result.txHash)} target="_blank" rel="noreferrer">
                Tingnan ang resibo ↗
              </a>
              <p className="muted small hash">{result.txHash}</p>
            </div>
          </section>
        );
      })()}

      {workflow.recovery && (
        <section className="card panel stack" aria-labelledby="recover-title">
          <h2 id="recover-title" className="h2">
            May padalang hindi pa tapos
          </h2>
          <p className="small">
            {workflow.recovery.operation} · OFW{" "}
            {shortAddress(workflow.recovery.address)} ·{" "}
            {workflow.recovery.prepared.txHash ?? "Wala pang transaction hash"}
          </p>
          <p>
            Puwede pang pumasok ang orihinal na transaksyon. Naka-save ito sa
            browser na ito. Huwag i-clear ang storage at huwag magpadala ng
            kapalit habang hindi pa malinaw.
          </p>
          <div>
            <button
              className="btn btn-primary"
              disabled={!enabled || workflow.busy}
              onClick={() => void workflow.reconcile()}
            >
              Check again
            </button>
          </div>
        </section>
      )}

      <FamilyBalances
        recipients={recipients}
        enabled={enabled}
        balances={family.balances}
        error={family.error}
        before={before}
        expected={outcome === "split" ? expected : null}
        last={
          resultStatus === "SUCCESS" &&
          (outcome === "split" || outcome === "refunded")
            ? { outcome, amountStroops: sentStroops, from: address || null, returnedTo }
            : null
        }
        onRefresh={() => void family.load()}
      />

      <Toast message={toast} onClose={closeToast} />

      <ActivityList
        events={activity.events}
        error={activity.error}
        enabled={enabled}
        deploymentUrl={config.deploymentUrl}
      />
    </main>
  );
}
