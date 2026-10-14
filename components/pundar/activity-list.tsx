"use client";
import type { EventItem } from "@/lib/paiflow";
import { txLink } from "@/lib/format";

const humanize = (s: string) =>
  s
    .replace(/[_.]+/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

// Plain names for the flow's events; unknown kinds fall back to humanize.
const LABEL: Record<string, string> = {
  RECEIVE: "Natanggap ang padala",
  PAYOUT: "Naipadala ang mga hati",
};
const label = (e: EventItem) =>
  LABEL[e.kind.toUpperCase()] ??
  `${humanize(e.kind)}${e.topic ? ` · ${humanize(e.topic)}` : ""}`;

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
        {enabled && !events.length && (
          <p className="muted">
            Wala pang bagong galaw. Puwedeng ma-late nang isang minuto ang
            listahan; tingnan muna ang resibo bago magpadala ulit.
          </p>
        )}
        {!!events.length && (
          <ol className="activity">
            {events.map((e) => (
              <li key={e.eventId}>
                <span className="what">{label(e)}</span>
                <a className="link small" href={txLink(e.txHash)} target="_blank" rel="noreferrer">
                  Resibo ↗
                </a>
                <time className="muted small" dateTime={e.occurredAt}>
                  {new Date(e.occurredAt).toLocaleString("en-PH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
