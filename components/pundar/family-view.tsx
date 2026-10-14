"use client";
import Link from "next/link";
import type { PublicConfig } from "@/lib/paiflow";
import { useActivity } from "@/lib/hooks/use-activity";
import { useBalances, useDiscovery } from "@/lib/hooks/use-pundar";
import { SHARES, type PundarRecipient } from "@/lib/pundar-split";
import { useProfile } from "@/lib/profile";
import { Ribbon } from "@/components/pundar/ribbon";
import { FamilyBalances } from "@/components/pundar/family-balances";
import { ActivityList } from "@/components/pundar/activity-list";

// Read-only view for relatives (and the OFW): the plan, balances, receipts.
export function FamilyView({
  config,
  recipients,
}: {
  config: PublicConfig;
  recipients: PundarRecipient[] | null;
}) {
  const enabled = config.mode === "demo" || config.mode === "team";
  const { profile } = useProfile();
  const { discovery, error: discoveryError } = useDiscovery(
    enabled,
    JSON.stringify(config),
  );
  const scope = discovery
    ? `${config.mode}:${discovery.platformOrigin}/${discovery.deploymentId}`
    : "unconfigured";
  const activity = useActivity(enabled && !!discovery, scope);
  const family = useBalances(enabled && !!recipients);
  const role = profile?.role;
  const mine =
    role === "household" || role === "student"
      ? SHARES.find((s) => s.key === role)
      : role === "ofw"
        ? SHARES.find((s) => s.key === "savings")
        : undefined;
  const firstName = profile?.name.split(" ")[0];

  return (
    <main className="container dash">
      <div className="dash-head">
        <div>
          <p className="eyebrow">Para sa pamilya</p>
          <h1 className="display h1-dash">
            {firstName ? `Hi, ${firstName}. ` : ""}
            Kita ng <em>lahat.</em>
          </h1>
          <p className="lead">
            Every padala and where each share went, right here. No need to
            ask.
          </p>
        </div>
      </div>

      {config.mode === "prepare" && (
        <p className="notice" role="status">
          Preparation mode — preview lang ito. Lalabas ang totoong balanse
          kapag na-set up na ang Paiflow flow.
        </p>
      )}
      {config.mode === "disabled" && (
        <p className="notice alert" role="alert">
          Payments unavailable: {config.message}
        </p>
      )}
      {discoveryError && (
        <p className="notice alert" role="alert">
          Discovery unavailable: {discoveryError}
        </p>
      )}

      <div className="card master split-5-7">
        <div className="panel panel-ink plan-panel">
          <p className="eyebrow eyebrow-light">Ang plano ng pamilya</p>
          <p className="display plan-quote">
            Napagkasunduan <em>minsan,</em> sinusunod <em>palagi.</em>
          </p>
          <Ribbon size="lg" />
        </div>
        <div className="panel">
          <ul className="plan-rows">
            {SHARES.map((s) => (
              <li key={s.key} className={mine?.key === s.key ? "mine" : ""}>
                <span className={`dot dot-${s.key}`} aria-hidden />
                <div>
                  <strong>
                    {s.tl} · {s.bps / 100}%
                  </strong>
                  <p className="muted small">{s.note}</p>
                </div>
                {mine?.key === s.key && <span className="tag">Iyo</span>}
              </li>
            ))}
          </ul>
          <p className="muted small">
            Hindi ito mababago nang palihim. Ang pagbabago ng plano ay bagong
            deployment na makikita ng lahat.
          </p>
          {role === "ofw" && (
            <Link className="btn btn-primary" href="/send">
              Magpadala <span className="arrow" aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>

      <FamilyBalances
        recipients={recipients}
        enabled={enabled}
        balances={family.balances}
        error={family.error}
        highlight={mine?.key}
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
