import Link from "next/link";
import type { CSSProperties } from "react";
import { SHARES } from "@/lib/pundar-split";
import { Ribbon } from "@/components/pundar/ribbon";

const d = (n: number) => ({ "--d": n }) as CSSProperties;

// Sample figures for illustration only (100 USDC through the 60/15/25 plan).
const SAMPLE = { household: "60.00", student: "15.00", savings: "25.00" };

const STEPS = [
  {
    title: "Pag-usapan ang plano",
    body: "Sa isang video call, magkakasundo ang pamilya: magkano para sa bahay, sa eskwela, at sa ipon ng OFW. Minsan lang ito.",
  },
  {
    title: "Magpadala gaya ng dati",
    body: "Pagdating ng sweldo, isang beses lang magpapadala ang OFW mula sa wallet niya. Walang hiwa-hiwalay na transfer.",
  },
  {
    title: "Hati agad, kita ng lahat",
    body: "Ilang segundo lang, nasa tamang wallet na ang bawat bahagi. May resibo ang bawat padala na makikita ng buong pamilya.",
  },
];

export default function Landing() {
  return (
    <main>
      <section className="container hero">
        <div>
          <p className="eyebrow rise" style={d(0)}>
            Para sa mga OFW at kanilang pamilya
          </p>
          <h1 className="display hero-title rise" style={d(1)}>
            Bawat padala, <em>may plano.</em>
          </h1>
          <p className="lead rise" style={d(2)}>
            Hinahati ng Pundar ang bawat remittance pagdating na pagdating:
            60% para sa bahay, 15% para sa eskwela, at 25% na ipon para sa
            OFW mismo. Napagkasunduan minsan, sinusunod palagi.
          </p>
          <div className="hero-actions rise" style={d(3)}>
            <Link className="btn btn-primary btn-lg" href="/register?role=ofw">
              Ako ay OFW <span className="arrow" aria-hidden>→</span>
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
              <p className="small muted">Nahati sa isang transaksyon · may resibo</p>
            </div>
          </div>
        </div>
      </section>

      <section id="paano" className="section">
        <div className="container two-col">
          <div className="sticky">
            <p className="eyebrow">Paano gumagana</p>
            <h2 className="display title">
              Tatlong hakbang, <em>walang</em> tanungan.
            </h2>
            <p className="lead">
              Hindi na kailangang itanong kung nabayaran na ang tuition o kung
              may naipon na. Makikita na lang.
            </p>
          </div>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="step">
                <span className="step-num display">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p className="muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container stack-lg">
          <div className="section-intro">
            <p className="eyebrow">Ang plano</p>
            <h2 className="display title">
              Isang padala, <em>tatlong</em> pupuntahan.
            </h2>
          </div>
          <Ribbon size="lg" />
          <div className="plan-grid">
            {SHARES.map((s) => (
              <div key={s.key} className={`plan-col plan-${s.key}`}>
                <p className="display plan-pct">{s.bps / 100}%</p>
                <h3>{s.tl}</h3>
                <p className="muted small">{s.who}</p>
                <p className="small">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card trust">
            <div className="panel">
              <h3 className="display trust-title">
                Hindi mababago <em>nang palihim.</em>
              </h3>
              <p className="muted">
                Kapag binago ang plano, bagong deployment ito na makikita ng
                buong pamilya.
              </p>
            </div>
            <div className="panel">
              <h3>May resibo bawat padala</h3>
              <p className="muted small">
                Bawat hati ay may pampublikong transaction link sa Stellar.
              </p>
            </div>
            <div className="panel">
              <h3>Test money pa lang</h3>
              <p className="muted small">
                Testnet ang ginagamit ngayon. Ang peso cash-out ang susunod.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-last">
        <div className="container">
          <div className="card master split-7-5">
            <div className="panel panel-ink cta-panel">
              <p className="eyebrow eyebrow-light">Simulan ngayon</p>
              <h2 className="display title">
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
            <div className="panel">
              <p className="eyebrow">Kailangan mo lang</p>
              <ul className="checklist">
                <li>Freighter wallet app sa browser</li>
                <li>Isang wallet para sa bawat miyembro ng plano</li>
                <li>Limang minuto para pag-usapan ang hati</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
