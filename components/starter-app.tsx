"use client";
import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { PublicConfig } from "@/lib/paiflow";
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
import { SHARES, expectedSplit, type PundarRecipient } from "@/lib/pundar-split";
import { formatUsdc, shortAddress, txLink } from "@/lib/format";
import { useProfile } from "@/lib/profile";
import { Ribbon } from "@/components/pundar/ribbon";
import { FamilyBalances } from "@/components/pundar/family-balances";
import { ActivityList } from "@/components/pundar/activity-list";

const QUICK = ["50", "100", "200"];

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
  const loadFamily = family.load;
  useEffect(() => {
    if (resultHash) void loadFamily();
  }, [resultHash, loadFamily]);

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
  const expected = sentStroops ? expectedSplit(sentStroops) : null;
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
                  : `Ipadala ang ${preview ? amount : "…"} USDC`}
              {!workflow.busy && <span className="arrow" aria-hidden>→</span>}
            </button>
            <p className="muted small">
              {enabled && !address
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

      {result && (
        <section
          className={`card result ${result.status === "SUCCESS" ? "ok" : result.status === "PENDING" ? "wait" : "bad"}`}
          aria-live="polite"
        >
          {result.status === "SUCCESS" && (
            <span className="tick" aria-hidden>
              <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </span>
          )}
          <div>
            <h2 className="h2">
              {result.status === "SUCCESS"
                ? "Nahati na ang padala."
                : result.status === "PENDING"
                  ? "Pinoproseso pa…"
                  : "Hindi natuloy ang padala."}
            </h2>
            {result.status === "SUCCESS" && expected && (
              <p className="lead small-lead">
                {SHARES.map((s) => `${formatUsdc(expected[s.key])} ${s.tl.toLowerCase()}`).join(" · ")}
              </p>
            )}
            {result.status === "PENDING" && (
              <p>
                Baka pumasok pa ito. Pindutin ang &ldquo;Check again&rdquo; sa
                ibaba — huwag munang magpadala ulit.
              </p>
            )}
            <a className="btn btn-ghost btn-sm" href={txLink(result.txHash)} target="_blank" rel="noreferrer">
              Tingnan ang resibo ↗
            </a>
            <p className="muted small hash">{result.txHash}</p>
          </div>
        </section>
      )}

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
        expected={expected}
        onRefresh={() => void family.load()}
      />

      <ActivityList
        events={activity.events}
        error={activity.error}
        enabled={enabled}
        deploymentUrl={config.deploymentUrl}
      />
    </main>
  );
}
