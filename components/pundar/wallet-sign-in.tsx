"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { connectWallet } from "@/lib/wallet";
import { shortAddress } from "@/lib/format";
import { SHARES, type PundarRecipient, type ShareKey } from "@/lib/pundar-split";
import {
  ROLE_LABEL,
  homeFor,
  readProfile,
  roleForAddress,
  saveProfile,
  type Role,
} from "@/lib/profile";
import { WalletIcon } from "@/components/pundar/icons";

const SHARE_FOR_ROLE: Record<Role, ShareKey> = {
  household: "household",
  student: "student",
  ofw: "savings",
};
const PREVIEW_ROLES: Array<{ role: Role; title: string; body: string }> = [
  { role: "ofw", title: "OFW", body: "Nagpapadala mula abroad." },
  { role: "household", title: "Guardian", body: "Humahawak ng pang-bahay." },
  { role: "student", title: "Estudyante", body: "Dito pumapasok ang baon." },
];
const FREIGHTER_ERROR =
  "Hindi mabuksan ang Freighter. I-install o i-unlock ito, saka subukan ulit.";
const STORAGE_ERROR =
  "Hindi ma-save sa browser na ito. Subukan sa ibang browser o i-off ang private mode.";

type State =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "known"; address: string; role: Role }
  | { kind: "unknown"; address: string };

// The wallet decides who you are: its address is matched against the family's
// configured Split recipients. No names, no self-declared roles.
export function WalletSignIn({
  walletEnabled,
  recipients,
}: {
  walletEnabled: boolean;
  recipients: PundarRecipient[] | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "idle" });
  const [previewRole, setPreviewRole] = useState<Role | null>(null);
  const [error, setError] = useState("");
  const preview = !walletEnabled || !recipients;

  async function connect() {
    setError("");
    setState({ kind: "busy" });
    try {
      const address = await connectWallet();
      const role = roleForAddress(address, recipients ?? []);
      setState(role ? { kind: "known", address, role } : { kind: "unknown", address });
    } catch {
      setError(FREIGHTER_ERROR);
      setState({ kind: "idle" });
    }
  }

  function enter(role: Role, address: string | null) {
    // Keep the name from register, if this browser has one.
    const name = readProfile()?.name;
    const ok = saveProfile(
      address
        ? { role, address, ...(name ? { name } : {}) }
        : { role, preview: true, ...(name ? { name } : {}) },
    );
    if (!ok) return setError(STORAGE_ERROR);
    router.push(homeFor(role));
  }

  if (preview) {
    return (
      <div className="stack">
        <p className="notice small" role="status">
          Preview mode: naka-off pa ang wallet, kaya pumili muna ng role para
          makita ang app. Sa totoong gamit, ang wallet mo ang magsasabi kung
          sino ka.
        </p>
        <div className="choices" role="radiogroup" aria-label="Role sa preview">
          {PREVIEW_ROLES.map((r) => (
            <button
              key={r.role}
              type="button"
              role="radio"
              aria-checked={previewRole === r.role}
              className="choice"
              onClick={() => setPreviewRole(r.role)}
            >
              <span className={`dot dot-lg dot-${SHARE_FOR_ROLE[r.role]}`} aria-hidden />
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
        {error && <p className="notice alert" role="alert">{error}</p>}
        <button
          className="btn btn-primary btn-block btn-lg"
          disabled={!previewRole}
          onClick={() => previewRole && enter(previewRole, null)}
        >
          Tingnan ang preview <span className="arrow" aria-hidden>→</span>
        </button>
      </div>
    );
  }

  if (state.kind === "known") {
    const share = SHARES.find((s) => s.key === SHARE_FOR_ROLE[state.role])!;
    return (
      <div className="stack" aria-live="polite">
        <div className={`identity plan-${share.key}`}>
          <span className={`dot dot-lg dot-${share.key}`} aria-hidden />
          <div>
            <p className="identity-label">Kilala ka ng plano</p>
            <p className="identity-role">
              Ikaw ang <strong>{ROLE_LABEL[state.role]}</strong> ng planong ito.
            </p>
            <p className="muted small">
              {share.tl} · {share.bps / 100}% · {shortAddress(state.address)}
            </p>
          </div>
        </div>
        {error && <p className="notice alert" role="alert">{error}</p>}
        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={() => enter(state.role, state.address)}
        >
          Magpatuloy <span className="arrow" aria-hidden>→</span>
        </button>
      </div>
    );
  }

  if (state.kind === "unknown") {
    return (
      <div className="stack" aria-live="polite">
        <div className="notice alert" role="alert">
          <strong>Hindi kasama ang wallet na ito sa plano ng pamilya.</strong>
          <span className="block small">
            {shortAddress(state.address)} ay hindi pang-bahay, estudyante, o
            ipon ng OFW sa planong ito. Lumipat ng account sa Freighter, saka
            subukan ulit.
          </span>
        </div>
        <div className="row-actions">
          <button className="btn btn-primary grow" onClick={() => void connect()}>
            Subukan ang ibang wallet
          </button>
          <Link className="btn btn-ghost" href="/family">
            Tingnan ang pamilya
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="explain">
        <span className="explain-icon"><WalletIcon /></span>
        <p className="small">
          Walang password o pangalan. Bubuksan namin ang{" "}
          <strong>Freighter</strong> at itutugma ang wallet mo sa plano ng
          pamilya. Hinding-hindi namin hihingin ang secret words mo.
        </p>
      </div>
      {error && <p className="notice alert" role="alert">{error}</p>}
      <button
        className="btn btn-primary btn-block btn-lg"
        disabled={state.kind === "busy"}
        onClick={() => void connect()}
      >
        {state.kind === "busy" ? "Binubuksan ang Freighter…" : "Buksan ang Freighter"}
        <span className="arrow" aria-hidden>→</span>
      </button>
    </div>
  );
}
