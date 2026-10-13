import { expect, it } from "vitest";
import { SHARES, expectedSplit } from "@/lib/pundar-split";

it("shares sum to exactly 10,000 bps", () => {
  expect(SHARES.reduce((sum, s) => sum + s.bps, 0)).toBe(10_000);
});
it("splits 100 USDC into 60 / 15 / 25", () => {
  expect(expectedSplit("1000000000")).toEqual({
    household: "600000000",
    student: "150000000",
    savings: "250000000",
  });
});
it("gives the rounding remainder to the last recipient", () => {
  const split = expectedSplit("10000001");
  expect(split).toEqual({
    household: "6000000",
    student: "1500000",
    savings: "2500001",
  });
  expect(
    Object.values(split).reduce((sum, v) => sum + BigInt(v), 0n),
  ).toBe(10000001n);
});
