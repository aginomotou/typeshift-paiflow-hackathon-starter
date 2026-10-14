import Link from "next/link";
import { Ribbon } from "@/components/pundar/ribbon";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href="/" className="wordmark wordmark-light">
            <span>Pundar</span>
            <Ribbon size="sm" />
          </Link>
          <p className="display footer-tagline">
            Bawat padala, <em>may plano.</em>
          </p>
        </div>

        <nav className="footer-col" aria-label="Pundar">
          <p className="footer-head">Pundar</p>
          <Link href="/#paano">Paano gumagana</Link>
          <Link href="/#plano">Ang plano</Link>
          <Link href="/about">Tungkol sa amin</Link>
        </nav>
        <nav className="footer-col" aria-label="Account">
          <p className="footer-head">Account</p>
          <Link href="/register">Gumawa ng account</Link>
          <Link href="/login">Mag-login</Link>
        </nav>
        <div className="footer-col">
          <p className="footer-head">Gawa ng TypeShift</p>
          <p>BS Information Technology</p>
          <p>José Rizal University</p>
        </div>
      </div>

      <div className="container footer-base">
        <span>Prototype on the Stellar testnet, powered by Paiflow. No real money moves.</span>
        <span>© 2026 TypeShift</span>
      </div>
    </footer>
  );
}
