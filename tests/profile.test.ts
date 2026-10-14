import { describe, expect, it } from "vitest";
import { parseProfile, roleForAddress } from "@/lib/profile";

const addr = (c: string) => `G${c.repeat(55)}`;
const HOUSEHOLD = addr("A");
const STUDENT = addr("B");
const SAVINGS = addr("C");
const recipients = [
  { key: "household" as const, address: HOUSEHOLD },
  { key: "student" as const, address: STUDENT },
  { key: "savings" as const, address: SAVINGS },
];

describe("roleForAddress", () => {
  it("maps each configured wallet to its role; savings is the OFW", () => {
    expect(roleForAddress(HOUSEHOLD, recipients)).toBe("household");
    expect(roleForAddress(STUDENT, recipients)).toBe("student");
    expect(roleForAddress(SAVINGS, recipients)).toBe("ofw");
  });
  it("returns null for a wallet outside the plan", () => {
    expect(roleForAddress(addr("D"), recipients)).toBeNull();
  });
  it("returns null with no recipients or an invalid address", () => {
    expect(roleForAddress(HOUSEHOLD, [])).toBeNull();
    expect(roleForAddress("not-an-address", recipients)).toBeNull();
    expect(roleForAddress("", recipients)).toBeNull();
  });
});

describe("parseProfile", () => {
  it("accepts a wallet-derived profile", () => {
    expect(parseProfile({ role: "ofw", address: SAVINGS })).toEqual({
      role: "ofw",
      address: SAVINGS,
    });
  });
  it("accepts a register profile with a name and no wallet yet", () => {
    expect(parseProfile({ name: "  Liza  ", role: "ofw" })).toEqual({
      name: "Liza",
      role: "ofw",
    });
  });
  it("keeps the name alongside a wallet and trims it to 60 chars", () => {
    expect(
      parseProfile({ name: "x".repeat(80), role: "student", address: STUDENT }),
    ).toEqual({ name: "x".repeat(60), role: "student", address: STUDENT });
  });
  it("drops an invalid address instead of trusting it", () => {
    expect(parseProfile({ role: "ofw", address: "not-a-wallet" })).toEqual({
      role: "ofw",
    });
  });
  it("keeps the preview flag", () => {
    expect(parseProfile({ role: "household", preview: true })).toEqual({
      role: "household",
      preview: true,
    });
  });
  it("rejects unknown roles and junk", () => {
    expect(parseProfile({ role: "admin", address: SAVINGS })).toBeNull();
    expect(parseProfile(null)).toBeNull();
    expect(parseProfile("ofw")).toBeNull();
  });
});
