import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { SiteHeader } from "@/components/pundar/site-header";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pundar — bawat padala, may plano",
  description:
    "Every OFW remittance split on arrival: household, school allowance and the OFW's own savings.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div className="container footer-inner">
            <span className="display footer-mark">Pundar</span>
            <span>Prototype sa Stellar testnet gamit ang Paiflow. Walang totoong pera.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
