"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { connectWallet } from "@/lib/wallet";
import { homeFor, saveProfile, useProfile, type Role } from "@/lib/profile";
import { Ribbon } from "@/components/pundar/ribbon";
import { KeyIcon } from "@/components/pundar/icons";

// Wallet-based sign-in: Freighter proves which wallet you control, so there is
// no password. Profile (name/role) is stored only in this browser.
export function LoginView({ walletEnabled }: { walletEnabled: boolean }) {
  const router = useRouter();
  const { profile } = useProfile();
  const [side, setSide] = useState<"ofw" | "family">("ofw");
  const [member, setMember] = useState<"household" | "student">("household");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setSide(profile.role === "ofw" ? "ofw" : "family");
    if (profile.role !== "ofw") setMember(profile.role);
  }, [profile]);

  async function enter() {
    setError("");
    const role: Role = side === "ofw" ? "ofw" : member;
    setBusy(true);
    try {
      const address = walletEnabled ? await connectWallet() : profile?.address;
      if (!saveProfile({ name: profile?.name ?? "", role, ...(address ? { address } : {}) }))
        throw new Error("storage");
      router.push(homeFor(role));
    } catch (e) {
      setError(
        e instanceof Error && e.message === "storage"
          ? "Hindi ma-save sa browser na ito. Subukan sa ibang browser o i-off ang private mode."
          : "Hindi mabuksan ang Freighter. I-install o i-unlock ito, saka subukan ulit.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container auth">
      <div className="card master split-5-7">
        <div className="panel panel-clay auth-art">
          <p className="eyebrow eyebrow-light">Pundar</p>
          <p className="display auth-quote">
            Para sa pamilya, <em>at para sa&apos;yo.</em>
          </p>
          <Ribbon size="md" />
        </div>
        <div className="panel stack">
          <div>
            <h1 className="display h1-auth">
              Maligayang <em>pagbabalik.</em>
            </h1>
            <p className="lead">Sino ang papasok ngayon?</p>
          </div>

          <div
            className="segmented"
            role="radiogroup"
            aria-label="Uri ng account"
            data-i={side === "ofw" ? 0 : 1}
          >
            <span className="thumb" aria-hidden />
            <button role="radio" aria-checked={side === "ofw"} onClick={() => setSide("ofw")}>
              Ako ay OFW
            </button>
            <button role="radio" aria-checked={side === "family"} onClick={() => setSide("family")}>
              Pamilya ako
            </button>
          </div>

          {side === "family" && (
            <div className="chips reveal-row" role="radiogroup" aria-label="Bahagi mo">
              <button
                className="chip-btn"
                role="radio"
                aria-checked={member === "household"}
                aria-pressed={member === "household"}
                onClick={() => setMember("household")}
              >
                Pang-bahay (guardian)
              </button>
              <button
                className="chip-btn"
                role="radio"
                aria-checked={member === "student"}
                aria-pressed={member === "student"}
                onClick={() => setMember("student")}
              >
                Estudyante
              </button>
            </div>
          )}

          <div className="explain">
            <span className="explain-icon"><KeyIcon /></span>
            <p className="small">
              Walang password. Bubuksan namin ang <strong>Freighter</strong>{" "}
              (ang wallet app mo) para patunayang sa&apos;yo ang account.
              Hinding-hindi namin hihingin ang secret words mo.
            </p>
          </div>

          {!walletEnabled && (
            <p className="notice small" role="status">
              Preview mode: hindi muna bubuksan ang wallet.
            </p>
          )}
          {error && <p className="notice alert" role="alert">{error}</p>}

          <button className="btn btn-primary btn-block btn-lg" disabled={busy} onClick={() => void enter()}>
            {busy ? "Binubuksan ang Freighter…" : walletEnabled ? "Buksan ang wallet" : "Magpatuloy (preview)"}
            <span className="arrow" aria-hidden>→</span>
          </button>
          <p className="small muted center">
            Bago ka rito?{" "}
            <Link className="link" href="/register">
              Gumawa ng account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
