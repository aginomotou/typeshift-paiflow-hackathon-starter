"use client";
import { useEffect, useState } from "react";
import type { ShareKey } from "@/lib/pundar-split";

// Prototype profile, kept only in this browser. It is NOT authentication:
// register lets people pick a role and name; login derives the role from the
// connected wallet (Freighter reports an address but is not a signed proof).
// Money stays safe because every payment still needs the wallet's own
// signature. Never put secrets, tokens or recovery phrases here.
export type Role = "ofw" | "household" | "student";
export type Profile = {
  role: Role;
  name?: string;
  address?: string;
  // Preview mode only (wallet disabled or recipients unset).
  preview?: boolean;
};

const KEY = "pundar:profile:v1";
const EVENT = "pundar:profile";
const ROLES: Role[] = ["ofw", "household", "student"];
const G_ADDRESS = /^G[A-Z2-7]{55}$/;

export const ROLE_LABEL: Record<Role, string> = {
  ofw: "OFW",
  household: "Pang-bahay",
  student: "Estudyante",
};
export const homeFor = (role: Role) => (role === "ofw" ? "/send" : "/family");

// The OFW sends from the same wallet that receives the savings share.
const ROLE_FOR_SHARE: Record<ShareKey, Role> = {
  household: "household",
  student: "student",
  savings: "ofw",
};

// Which role a wallet holds in the configured plan, or null if it isn't in it.
export function roleForAddress(
  address: string,
  recipients: ReadonlyArray<{ key: ShareKey; address: string }>,
): Role | null {
  if (!G_ADDRESS.test(address)) return null;
  const match = recipients.find((r) => r.address === address);
  return match ? ROLE_FOR_SHARE[match.key] : null;
}

// Validates a stored value: a known role, plus optional name and wallet.
export function parseProfile(value: unknown): Profile | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (!ROLES.includes(v.role as Role)) return null;
  return {
    role: v.role as Role,
    ...(typeof v.name === "string" && v.name.trim()
      ? { name: v.name.trim().slice(0, 60) }
      : {}),
    ...(typeof v.address === "string" && G_ADDRESS.test(v.address)
      ? { address: v.address }
      : {}),
    ...(v.preview === true ? { preview: true } : {}),
  };
}

export function readProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? parseProfile(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}
export function saveProfile(profile: Profile): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch {
    return false;
  }
}
export function clearProfile() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: nothing to clear.
  }
  window.dispatchEvent(new Event(EVENT));
}
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setProfile(readProfile());
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return { profile, ready };
}
