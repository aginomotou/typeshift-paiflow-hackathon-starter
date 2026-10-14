"use client";
import Link from "next/link";
import type { PundarRecipient } from "@/lib/pundar-split";
import { Ribbon } from "@/components/pundar/ribbon";
import { WalletSignIn } from "@/components/pundar/wallet-sign-in";

// Wallet-based sign-in: the connected address decides the role. No password,
// no name. The result is stored only in this browser.
export function LoginView({
  walletEnabled,
  recipients,
}: {
  walletEnabled: boolean;
  recipients: PundarRecipient[] | null;
}) {
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
          <div className="stack-sm">
            <h1 className="display h1-auth">
              Welcome <em>back.</em>
            </h1>
            <p className="lead">
              {walletEnabled && recipients
                ? "Buksan ang wallet mo para makapasok."
                : "Pumili ng role para makita ang preview."}
            </p>
          </div>

          <WalletSignIn walletEnabled={walletEnabled} recipients={recipients} />

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
