"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { connectWallet } from "@/lib/wallet";
import { homeFor, saveProfile, type Role } from "@/lib/profile";
import { Ribbon } from "@/components/pundar/ribbon";
import { WalletIcon } from "@/components/pundar/icons";

const ROLES: Array<{ role: Role; title: string; body: string; dot: string }> = [
  { role: "ofw", title: "Ako ang OFW", body: "Ako ang nagpapadala mula abroad.", dot: "savings" },
  { role: "household", title: "Ako ang guardian", body: "Ako ang humahawak ng pang-bahay.", dot: "household" },
  { role: "student", title: "Ako ang estudyante", body: "Dito pumapasok ang baon ko.", dot: "student" },
];
const STEPS = ["Sino ka", "Pangalan", "Wallet"];

export function RegisterView({
  walletEnabled,
  initialRole,
}: {
  walletEnabled: boolean;
  initialRole: Role | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(initialRole ? 1 : 0);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [role, setRole] = useState<Role | null>(initialRole);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const go = (to: number) => {
    setDir(to > step ? "fwd" : "back");
    setError("");
    setStep(to);
  };

  async function connect() {
    setBusy(true);
    setError("");
    try {
      setAddress(await connectWallet());
    } catch {
      setError("Hindi mabuksan ang Freighter. I-install o i-unlock ito, saka subukan ulit.");
    } finally {
      setBusy(false);
    }
  }

  function finish() {
    if (!role) return go(0);
    const ok = saveProfile({ name: name.trim(), role, ...(address ? { address } : {}) });
    if (!ok) {
      setError("Hindi ma-save sa browser na ito. Subukan sa ibang browser o i-off ang private mode.");
      return;
    }
    router.push(homeFor(role));
  }

  return (
    <main className="container auth">
      <div className="card master split-5-7">
        <div className="panel panel-clay auth-art">
          <p className="eyebrow eyebrow-light">Bagong account</p>
          <p className="display auth-quote">
            Tatlong hakbang. <em>Isang plano</em> para sa buong pamilya.
          </p>
          <Ribbon size="md" />
        </div>

        <div className="panel stack">
          <div className="stack-sm">
            <p className="eyebrow">
              Hakbang {step + 1} sa {STEPS.length} · {STEPS[step]}
            </p>
            <div className="progress" aria-hidden>
              {STEPS.map((s, i) => (
                <span key={s} className={i <= step ? "done" : ""} />
              ))}
            </div>
          </div>

          <div key={step} className={`step-pane ${dir}`}>
            {step === 0 && (
              <div className="stack">
                <h1 className="display h1-auth">
                  Sino ka sa <em>pamilya?</em>
                </h1>
                <div className="choices" role="radiogroup" aria-label="Sino ka">
                  {ROLES.map((r) => (
                    <button
                      key={r.role}
                      role="radio"
                      aria-checked={role === r.role}
                      className="choice"
                      onClick={() => setRole(r.role)}
                    >
                      <span className={`dot dot-lg dot-${r.dot}`} aria-hidden />
                      <span>
                        <strong>{r.title}</strong>
                        <span className="muted small block">{r.body}</span>
                      </span>
                      <span className="check" aria-hidden>
                        <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                      </span>
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary btn-block btn-lg" disabled={!role} onClick={() => go(1)}>
                  Susunod <span className="arrow" aria-hidden>→</span>
                </button>
              </div>
            )}

            {step === 1 && (
              <form
                className="stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (name.trim()) go(2);
                }}
              >
                <h1 className="display h1-auth">
                  Anong <em>pangalan</em> mo?
                </h1>
                <label className="field">
                  <span>Pangalan (ito ang makikita ng pamilya)</span>
                  <input
                    className="input"
                    autoFocus
                    autoComplete="given-name"
                    maxLength={60}
                    placeholder="hal. Liza"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <div className="row-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => go(0)}>
                    ← Bumalik
                  </button>
                  <button className="btn btn-primary grow" disabled={!name.trim()}>
                    Susunod <span className="arrow" aria-hidden>→</span>
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="stack">
                <h1 className="display h1-auth">
                  Ikonekta ang <em>wallet.</em>
                </h1>
                <div className="explain">
                  <span className="explain-icon"><WalletIcon /></span>
                  <p className="small">
                    Ang <strong>Freighter</strong> ay parang GCash para sa
                    padalang ito. Dito papasok ang bahagi mo
                    {role === "ofw" ? " at dito ka magpapadala" : ""}. Ikaw
                    lang ang may hawak ng secret words — huwag itong ibigay
                    kahit kanino, kahit sa amin.
                  </p>
                </div>
                {address ? (
                  <p className="notice info" role="status">
                    Konektado: {address.slice(0, 4)}…{address.slice(-4)}
                  </p>
                ) : (
                  <button
                    className="btn btn-ghost btn-block"
                    disabled={!walletEnabled || busy}
                    onClick={() => void connect()}
                  >
                    {busy ? "Binubuksan…" : "Buksan ang Freighter"}
                  </button>
                )}
                {!walletEnabled && (
                  <p className="notice small" role="status">
                    Preview mode: puwede mo munang laktawan ito.
                  </p>
                )}
                {error && <p className="notice alert" role="alert">{error}</p>}
                <div className="row-actions">
                  <button className="btn btn-ghost" onClick={() => go(1)}>
                    ← Bumalik
                  </button>
                  <button className="btn btn-primary grow" onClick={finish}>
                    {address ? "Tapos na" : "Laktawan muna"}{" "}
                    <span className="arrow" aria-hidden>→</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="small muted center">
            May account na?{" "}
            <Link className="link" href="/login">
              Mag-login
            </Link>
          </p>
          <p className="small muted center">
            Prototype: ang pangalan mo ay naka-save lang sa device na ito.
          </p>
        </div>
      </div>
    </main>
  );
}
