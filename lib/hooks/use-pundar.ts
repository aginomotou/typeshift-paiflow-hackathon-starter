"use client";
import { useCallback, useEffect, useState } from "react";
import { browserRequest } from "@/lib/browser-api";
import type { Discovery } from "@/components/deployment-panels";
import type { RecipientBalance, ShareKey } from "@/lib/pundar-split";

export type Balances = { balances: RecipientBalance[]; readAt: string };
export type Snapshot = Partial<Record<ShareKey, string>>;

export function snapshot(b: Balances | null): Snapshot {
  const out: Snapshot = {};
  for (const r of b?.balances ?? [])
    if (r.balanceStroops !== null) out[r.key] = r.balanceStroops;
  return out;
}

export function useDiscovery(enabled: boolean, configIdentity: string) {
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setDiscovery(null);
    setError("");
    void browserRequest<Discovery>("/api/integration?read=capabilities")
      .then((c) => {
        if (!cancelled) setDiscovery(c);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, configIdentity]);
  return { discovery, error };
}

// Recipient USDC balances from /api/pundar: on load, every 10 s while visible.
export function useBalances(enabled: boolean) {
  const [balances, setBalances] = useState<Balances | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!enabled) return null;
    try {
      const b = await browserRequest<Balances>("/api/pundar");
      setBalances(b);
      setError("");
      return b;
    } catch (e) {
      setError(String(e));
      return null;
    }
  }, [enabled]);
  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, 10_000);
    return () => clearInterval(timer);
  }, [load]);
  return { balances, error, load };
}
