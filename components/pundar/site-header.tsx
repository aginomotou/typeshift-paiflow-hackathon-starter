"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Ribbon } from "@/components/pundar/ribbon";
import { clearProfile, homeFor, useProfile } from "@/lib/profile";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useProfile();
  const current = (href: string) =>
    pathname === href ? ("page" as const) : undefined;

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href={profile ? homeFor(profile.role) : "/"} className="wordmark">
          <span>Pundar</span>
          <Ribbon size="sm" />
        </Link>
        <nav className="nav" aria-label="Pangunahing menu">
          {profile ? (
            <>
              {profile.role === "ofw" && (
                <Link href="/send" aria-current={current("/send")}>
                  Magpadala
                </Link>
              )}
              <Link href="/family" aria-current={current("/family")}>
                Pamilya
              </Link>
              <button
                className="nav-quiet"
                onClick={() => {
                  clearProfile();
                  router.push("/");
                }}
              >
                Mag-logout
              </button>
            </>
          ) : (
            <>
              <Link href="/#paano" className="hide-sm">
                Paano
              </Link>
              <Link href="/login" aria-current={current("/login")}>
                Mag-login
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Magsimula
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
