import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tungkol sa Pundar",
  description:
    "Why we built Pundar, and the TypeShift team from José Rizal University behind it.",
};

const TEAM = [
  { name: "Trisha Nicole Aguilar", initials: "TA" },
  { name: "Khobe Clayne Lolong", initials: "KL" },
  { name: "Jharell James Sederia", initials: "JS" },
  { name: "Gabriel Resultay", initials: "GR" },
];

export default function AboutPage() {
  return (
    <main>
      <header className="container page-head">
        <p className="eyebrow">Tungkol sa Pundar</p>
        <h1 className="display h1-dash">
          The story behind <em>Pundar.</em>
        </h1>
        <p className="lead">
          Why a remittance should come with a plan, and the four students who
          built one.
        </p>
      </header>

      <section className="section section-about" aria-label="Ang kuwento at ang team">
        <div className="container about-grid">
          <div className="about-story">
            <div className="definition">
              <p className="display definition-word">
                pun·dar
              </p>
              <p className="definition-meta">pandiwa · Filipino</p>
              <p className="definition-body">
                To build up something lasting from your own earnings: a house,
                a small business, savings for the future.
              </p>
            </div>
            <p>
              Every month, OFWs send their pay home, usually to one relative
              who stretches it across food, bills and tuition. Saving tends to
              come last. Only <strong>34.6%</strong> of OFWs had savings in 2022,
              down from <strong>53.1%</strong> in 2009.
            </p>
            <p className="muted small">
              Source: PSA Survey on Overseas Filipinos, via Philstar (2023).
            </p>
            <p>
              We built Pundar so that part of every padala is set aside for the
              person who earned it, automatically, the moment it arrives. Years
              abroad should add up to something to come home to.
            </p>
          </div>

          <div className="team">
            <div className="team-head">
              <p className="eyebrow">Ang team</p>
              <h2 className="display title">
                Gawa ng <em>TypeShift.</em>
              </h2>
              <p className="muted">
                Four BS Information Technology students from José Rizal
                University, building Pundar for the Paiflow hackathon.
              </p>
            </div>
            <ul className="team-list">
              {TEAM.map((m) => (
                <li key={m.name}>
                  <span className="monogram display" aria-hidden>
                    {m.initials}
                  </span>
                  <span>
                    <strong className="team-name">{m.name}</strong>
                    <span className="muted small block">
                      BSIT · José Rizal University
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
