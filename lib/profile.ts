"use client";
import { useEffect, useState } from "react";

// Prototype profile: name and role, kept only in this browser. It is NOT
// authentication. Never put secrets, tokens or recovery phrases here.
export type Role = "ofw" | "household" | "student";
export type Profile = { name: string; role: Role; address?: string };

const KEY = "pundar:profile:v1";
const EVENT = "pundar:profile";
const ROLES: Role[] = ["ofw", "household", "student"];

export const ROLE_LABEL: Record<Role, string> = {
  ofw: "OFW",
  household: "Pang-bahay",
  student: "Estudyante",
};
export const homeFor = (role: Role) => (role === "ofw" ? "/send" : "/family");

export function readProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<Profile>;
    if (typeof value.name !== "string" || !ROLES.includes(value.role as Role))
      return null;
    return {
      name: value.name.slice(0, 60),
      role: value.role as Role,
      ...(typeof value.address === "string" &&
      /^G[A-Z2-7]{55}$/.test(value.address)
        ? { address: value.address }
        : {}),
    };
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
