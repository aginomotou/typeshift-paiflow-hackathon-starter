import Link from "next/link";
import type { CSSProperties } from "react";
import { SHARES } from "@/lib/pundar-split";
import { Ribbon } from "@/components/pundar/ribbon";
import { SplitDonut } from "@/components/pundar/split-donut";

const d = (n: number) => ({ "--d": n }) as CSSProperties;

// Sample figures for illustration only (100 USDC through the 60/15/25 plan).
const SAMPLE = { household: "60.00", student: "15.00", savings: "25.00" };

export default function Landing() {
  return (
    <main>
      <section className="container hero">
        <div>
          <p className="eyebrow rise" style={d(0)}>
            Para sa mga OFW at sa pamilyang naiwan
          </p>
          <h1 className="display hero-title rise" style={d(1)}>
            Bawat padala, <em>may plano.</em>
          </h1>
          <p className="lead rise" style={d(2)}>
            Pundar splits every remittance the moment it lands: 60% for the
            household, 15% for school, and 25% into savings only the OFW
            controls. The family agrees once, and every padala follows it.
          </p>
          <div className="hero-actions rise" style={d(3)}>
            <Link className="btn btn-primary btn-lg" href="/register?role=ofw">
              Ako ang OFW <span className="arrow" aria-hidden>→</span>
            </Link>
            <Link className="btn btn-ghost btn-lg" href="/register?role=household">
              Pamilya ako
            </Link>
          </div>
          <p className="small muted rise" style={d(4)}>
            May account na?{" "}
            <Link className="link" href="/login">
              Mag-login
            </Link>
          </p>
        </div>

        <div className="rise" style={d(3)}>
          <div className="card preview">
            <div className="airmail" aria-hidden />
            <div className="preview-body">
              <div className="preview-head">
                <div>
                  <p className="eyebrow">Padala ngayong buwan</p>
                  <p className="display preview-amount">
                    100<span>.00</span> <small>USDC</small>
                  </p>
                </div>
                <span className="stamp">Halimbawa</span>
              </div>
              <Ribbon size="lg" />
              <ul className="split-list">
                {SHARES.map((s, i) => (
                  <li key={s.key} className="rise" style={d(5 + i)}>
                    <span className={`dot dot-${s.key}`} aria-hidden />
                    <span>
                      <strong>{s.tl}</strong>
                      <span className="muted small block">{s.who}</span>
                    </span>
                    <span className="num">{SAMPLE[s.key]}</span>
                  </li>
                ))}
              </ul>
              <p className="small muted">Split in one transaction, with a receipt</p>
            </div>
          </div>
        </div>
      </section>

      <section id="paano" className="section section-how">
        <div className="container stack-lg">
          <div className="split-head">
            <div>
              <p className="eyebrow">Paano gumagana</p>
              <h2 className="display title">
                Agree once. <em>Send once.</em>
              </h2>
            </div>
            <p className="lead">
              No more asking whether tuition got paid or if anything was
              saved. The split happens on its own, and everyone can see it.
            </p>
          </div>

          <ol className="route">
            <li className="route-step">
              <span className="route-num display">1</span>
              <h3>Pag-usapan ang hati</h3>
              <p className="muted">
                On one video call, the family settles how much goes to the
                house, to school, and to the OFW&apos;s own savings. You only
                do this once.
              </p>
              <div className="vignette" aria-hidden>
                <Ribbon size="md" />
                <div className="vignette-pcts">
                  {SHARES.map((s) => (
                    <span key={s.key} className={`plan-${s.key}`}>
                      {s.bps / 100}%
                    </span>
                  ))}
                </div>
              </div>
            </li>
            <li className="route-step">
              <span className="route-num display">2</span>
              <h3>Magpadala gaya ng dati</h3>
              <p className="muted">
                On payday, the OFW sends one payment from their wallet. No
                more three separate transfers to three people.
              </p>
              <div className="vignette vignette-send" aria-hidden>
                <span className="display">
                  100 <small>USDC</small>
                </span>
                <span className="vignette-pill">Isang padala →</span>
              </div>
            </li>
            <li className="route-step">
              <span className="route-num display">3</span>
              <h3>Hati agad, kita ng lahat</h3>
              <p className="muted">
                Within seconds, each share lands in the right wallet, with a
                public receipt the whole family can open.
              </p>
              <div className="vignette" aria-hidden>
                <ul className="vignette-rows">
                  {SHARES.map((s) => (
                    <li key={s.key}>
                      <span className={`dot dot-${s.key}`} />
                      <span>{s.tl}</span>
                      <span className="num">+{SAMPLE[s.key]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section id="plano" className="section section-tint">
        <div className="container plan-layout">
          <div className="plan-copy">
            <p className="eyebrow">Ang plano</p>
            <h2 className="display title">
              Isang padala, <em>tatlong</em> pupuntahan.
            </h2>
            <p className="lead">
              The split is set before the flow goes live and can&apos;t be
              changed per remittance. That&apos;s the point: the money follows
              the plan, not whoever happens to receive it.
            </p>
          </div>
          <SplitDonut />
        </div>
      </section>

      <section className="section section-promise">
        <div className="container two-col">
          <div className="sticky">
            <p className="eyebrow">Ang pangako</p>
            <h2 className="display title">
              The plan holds, <em>kahit walang nagbabantay.</em>
            </h2>
            <p className="lead">
              No single person holds all the money. The split the family agreed
              on is what moves it, and every step leaves a trail.
            </p>
          </div>
          <dl className="promises">
            <div className="promise">
              <dt className="display">
                No quiet <em>changes.</em>
              </dt>
              <dd className="muted">
                Changing the plan means a new deployment, and the whole family
                sees it.
              </dd>
            </div>
            <div className="promise">
              <dt className="display">
                A receipt for <em>every padala.</em>
              </dt>
              <dd className="muted">
                Every split has a public transaction link on Stellar that
                anyone in the family can check.
              </dd>
            </div>
            <div className="promise">
              <dt className="display">
                Test money, <em>for now.</em>
              </dt>
              <dd className="muted">
                Pundar runs on the Stellar testnet today. Cash-out to pesos is
                the next step.
              </dd>
              <span className="stamp promise-stamp" aria-hidden>
                Testnet
              </span>
            </div>
          </dl>
        </div>
      </section>

      <section className="cta-band" aria-labelledby="cta-title">
        <div className="airmail" aria-hidden />
        <div className="container cta-grid">
          <div>
            <p className="eyebrow eyebrow-light">Simulan na</p>
            <h2 id="cta-title" className="display title">
              Para sa pamilya, <em>at para sa&apos;yo.</em>
            </h2>
            <div className="hero-actions">
              <Link className="btn btn-clay btn-lg" href="/register">
                Gumawa ng account <span className="arrow" aria-hidden>→</span>
              </Link>
              <Link className="btn btn-ghost-light btn-lg" href="/login">
                Mag-login
              </Link>
            </div>
          </div>
          <div className="cta-needs">
            <p className="eyebrow eyebrow-light">What you&apos;ll need</p>
            <ul className="checklist">
              <li>The Freighter wallet extension</li>
              <li>A wallet for each person in the plan</li>
              <li>Five minutes to agree on the split</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
