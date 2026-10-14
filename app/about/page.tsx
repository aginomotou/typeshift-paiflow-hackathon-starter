import type { Metadata } from "next";
import Link from "next/link";
import { Ribbon } from "@/components/pundar/ribbon";
import { PostageStamp } from "@/components/pundar/postage-stamp";

export const metadata: Metadata = {
  title: "Tungkol sa Pundar",
  description:
    "A note to OFW families from TypeShift, the BSIT team from José Rizal University behind Pundar.",
};

const TEAM = [
  "Trisha Nicole Aguilar",
  "Khobe Clayne Lolong",
  "Jharell James Sederia",
  "Gabriel Resultay",
];

const SOURCES = [
  {
    outlet: "Philstar",
    title: "Remittances reach record high $35.6 billion (BSP data)",
    href: "https://www.philstar.com/business/2026/02/17/2508451/remittances-reach-record-high-356-billion/amp/",
  },
  {
    outlet: "Philstar",
    title: "OFW savers declining in last 14 years (PSA)",
    href: "https://www.philstar.com/business/2023/11/18/2312428/ofw-savers-declining-last-14-years/amp/",
  },
  {
    outlet: "GMA News",
    title: "OFWs grew to 2.19M in 2024 — PSA",
    href: "https://www.gmanetwork.com/news/pinoyabroad/dispatch/969755/ofws-grew-to-2-19m-in-2024-psa/story/",
  },
  {
    outlet: "Inquirer",
    title: "BSP data: OFW remittances go to food, basic needs",
    href: "https://newsinfo.inquirer.net/?p=2153866",
  },
];

const STATS = [
  {
    tone: "household",
    tilt: -1.5,
    value: "$35.63B",
    body: "Record remittances sent home in 2025.",
    source: "BSP, via Philstar",
  },
  {
    tone: "student",
    tilt: 1,
    value: "2.19M",
    body: "Overseas Filipino workers in 2024.",
    source: "PSA, via GMA News",
  },
  {
    tone: "savings",
    tilt: -0.5,
    value: "95.7%",
    body: "of OFW households say remittances go mainly to food and basic needs.",
    source: "BSP survey, via Inquirer",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="container about">
      <header className="dash-head">
        <p className="eyebrow">Tungkol sa Pundar</p>
        <h1 className="display h1-dash">
          A note to every <em>OFW family.</em>
        </h1>
        <p className="lead">
          Why we built Pundar, from the four students behind it.
        </p>
      </header>

      <article className="card postcard" aria-label="Liham mula sa TypeShift">
        <div className="airmail" aria-hidden />
        <div className="postcard-body">
          <div className="postcard-message">
            <p className="display salutation">Dear OFW family,</p>
            <p>
              Every payday, the whole salary goes home to one person, and it
              has to cover everything: food, bills, tuition. Saving for the
              one who earned it usually waits until &ldquo;next month.&rdquo;
            </p>
            <p>
              The numbers show it. In 2009,{" "}
              <strong className="figure-inline">53.1%</strong> of OFWs had
              savings. By 2022, only{" "}
              <strong className="figure-inline figure-drop">34.6%</strong> did.
            </p>
            <p>
              So we built Pundar. Your family agrees on a plan once,{" "}
              <strong className="figure-inline plan-household">60</strong> for
              the household,{" "}
              <strong className="figure-inline plan-student">15</strong> for
              school,{" "}
              <strong className="figure-inline plan-savings">25</strong> for
              your own savings, and every padala follows it the moment it
              lands. Everyone can see the receipt. Nobody has to ask.
            </p>
            <p>
              It&apos;s still a testnet prototype, but the idea is simple: years
              of work abroad should add up to something to come home to.
            </p>

            <div className="signoff">
              <p className="signoff-line">Para sa pamilya, at para sa&apos;yo,</p>
              <ul className="signatures">
                {TEAM.map((name) => (
                  <li key={name} className="display">
                    {name}
                  </li>
                ))}
              </ul>
              <p className="signoff-team">
                <strong>TypeShift</strong> · BS Information Technology, José
                Rizal University
              </p>
            </div>
          </div>

          <div className="postcard-address">
            <div className="address-top">
              <p className="postcard-label" aria-hidden>
                Post card
                <span>Padala · Via airmail</span>
              </p>
              <div className="stamp-corner">
              <PostageStamp tone="ink" tilt={2}>
                <span className="display stamp-mark">Pundar</span>
                <Ribbon size="sm" />
                <span className="stamp-split">60 · 15 · 25</span>
                <span className="stamp-foot">Testnet</span>
              </PostageStamp>
              <svg className="postmark" viewBox="0 0 160 160" aria-hidden>
                <defs>
                  <path id="pm-ring" d="M80 80 m-58 0 a58 58 0 1 1 116 0 a58 58 0 1 1 -116 0" />
                </defs>
                <circle cx="80" cy="80" r="70" />
                <circle cx="80" cy="80" r="44" />
                <text>
                  <textPath href="#pm-ring" startOffset="2%">
                    José Rizal University · Mandaluyong ·
                  </textPath>
                </text>
                <text x="80" y="76" textAnchor="middle" className="pm-date">
                  OKT
                </text>
                <text x="80" y="96" textAnchor="middle" className="pm-date">
                  2026
                </text>
              </svg>
              <svg className="cancel" viewBox="0 0 220 60" aria-hidden>
                <path d="M0 12 q14 -10 28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0" />
                <path d="M0 30 q14 -10 28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0" />
                <path d="M0 48 q14 -10 28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0" />
              </svg>
              </div>
            </div>

            <dl className="address">
              <div>
                <dt>Para kay</dt>
                <dd className="display">Bawat pamilyang OFW</dd>
                <dd className="display">saan man sa mundo</dd>
              </div>
              <div>
                <dt>Mula kay</dt>
                <dd className="display">TypeShift</dd>
                <dd className="display">José Rizal University</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="airmail" aria-hidden />
      </article>

      <section className="stamp-strip" aria-labelledby="numbers-title">
        <h2 id="numbers-title" className="h2">
          Sa bilang
        </h2>
        <ul className="stamp-row">
          {STATS.map((s) => (
            <li key={s.value}>
              <PostageStamp tone={s.tone} tilt={s.tilt} className="stat-stamp">
                <span className="display stat-value">{s.value}</span>
                <span className="stat-body">{s.body}</span>
                <span className="stat-source">{s.source}</span>
              </PostageStamp>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-sources" aria-labelledby="sources-title">
        <p id="sources-title" className="eyebrow">Mga pinagkunan</p>
        <ul className="source-list">
          {SOURCES.map((s) => (
            <li key={s.href}>
              <span className="source-outlet">{s.outlet}</span>
              <a className="link" href={s.href} target="_blank" rel="noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-cta" aria-labelledby="cta-title">
        <div>
          <h2 id="cta-title" className="display read-on-title">
            Ready to make a <em>plan?</em>
          </h2>
          <p className="muted">
            Agree on the split once. Every padala after that follows it.
          </p>
        </div>
        <div className="about-cta-actions">
          <Link className="btn btn-primary btn-lg" href="/register">
            Magsimula <span className="arrow" aria-hidden>→</span>
          </Link>
          <Link className="btn btn-ghost btn-lg" href="/#plano">
            Tingnan ang plano
          </Link>
        </div>
      </section>
    </main>
  );
}
