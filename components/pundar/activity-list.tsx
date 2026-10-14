"use client";
import type { EventItem } from "@/lib/paiflow";
import { formatUsdc, txLink } from "@/lib/format";
import {
  groupPadala,
  returnedReason,
  returnedTitle,
  type Padala,
} from "@/lib/pundar-activity";

function describe(p: Padala) {
  if (p.outcome === "split")
    return { title: "Nahati ang padala", note: "60 / 15 / 25 sa pamilya", tone: "ok" };
  if (p.outcome === "refunded")
    return { title: returnedTitle(p), note: returnedReason(p.amountStroops), tone: "back" };
  return { title: "Hinihintay ang resulta", note: "Hinihintay pa ang detalye mula sa flow", tone: "muted" };
}

// One row per transaction (a padala), not one per contract event.
export function ActivityList({
  events,
  error,
  enabled,
  deploymentUrl,
}: {
  events: EventItem[];
  error: string;
  enabled: boolean;
  deploymentUrl?: string | null;
}) {
  const padala = groupPadala(events);
  return (
    <section aria-labelledby="activity-title" className="stack">
      <div className="section-head">
        <div>
          <p className="eyebrow">Mga resibo</p>
          <h2 id="activity-title" className="h2">
            Kasaysayan
          </h2>
        </div>
        {deploymentUrl && (
          <a className="link small" href={deploymentUrl} target="_blank" rel="noreferrer">
            Buksan sa Paiflow ↗
          </a>
        )}
      </div>
      {error && <p className="notice alert" role="alert">{error}</p>}
      <div className="card panel">
        {!enabled && (
          <p className="muted">Live feed is disabled in preparation mode.</p>
        )}
        {enabled && !padala.length && (
          <p className="muted">
            Wala pang bagong galaw. Puwedeng ma-late nang isang minuto ang
            listahan; tingnan muna ang resibo bago magpadala ulit.
          </p>
        )}
        {!!padala.length && (
          <ol className="activity">
            {padala.map((p) => {
              const o = describe(p);
              return (
                <li key={p.txHash} className={`activity-${o.tone}`}>
                  <span className="what">
                    {o.title}
                    {p.amountStroops && (
                      <span className="num"> · {formatUsdc(p.amountStroops)} USDC</span>
                    )}
                  </span>
                  <a className="link small" href={txLink(p.txHash)} target="_blank" rel="noreferrer">
                    Resibo ↗
                  </a>
                  <span className="muted small">
                    <span className="outcome-note">{o.note}</span> ·{" "}
                    <time dateTime={p.occurredAt}>
                      {new Date(p.occurredAt).toLocaleString("en-PH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
