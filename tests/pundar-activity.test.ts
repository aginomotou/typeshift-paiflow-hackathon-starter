import { expect, it } from "vitest";
import type { EventItem } from "@/lib/paiflow";
import {
  groupPadala,
  padalaOutcome,
  readPadala,
  returnedReason,
  returnedTitle,
} from "@/lib/pundar-activity";

// Shapes copied from the deployment's real events (addresses/hashes replaced).
const SENDER = `G${"S".repeat(55)}`;
const tx = (c: string) => c.repeat(64);
let n = 0;
const ev = (
  txHash: string,
  ledger: number,
  kind: string,
  topic: string,
  data: unknown,
): EventItem => ({
  id: `id-${++n}`,
  eventId: `${ledger}-${n}`,
  kind,
  topic,
  ledger,
  txHash,
  occurredAt: "2026-10-14T03:47:07.000Z",
  data,
});

const SPLIT = tx("a");
const REFUND = tx("b");
const splitEvents = [
  ev(SPLIT, 100, "RECEIVE", "deposit", { from: SENDER, asset: "USDC", amount: "300000000" }),
  ev(SPLIT, 100, "PAYOUT", "payout", { recipients: [{ bps: 6000 }, { bps: 1500 }, { bps: 2500 }] }),
  ev(SPLIT, 100, "PAYOUT", "route", { amountOut: "300000000", tookPathA: true }),
];
const refundEvents = [
  ev(REFUND, 200, "RECEIVE", "deposit", { from: SENDER, asset: "USDC", amount: "200000000" }),
  ev(REFUND, 200, "PAYOUT", "pay", { asset: "USDC", payment: "200000000", recipient: SENDER }),
  ev(REFUND, 200, "PAYOUT", "route", { amount: "200000000", topic1: false }),
];

it("treats a Split payout as a real split", () => {
  expect(padalaOutcome(splitEvents)).toBe("split");
});

it("treats a full pay back to the sender as a refund, not a split", () => {
  expect(padalaOutcome(refundEvents)).toBe("refunded");
});

it("is unknown when only the deposit has arrived", () => {
  expect(padalaOutcome(refundEvents.slice(0, 1))).toBe("unknown");
});

it("collapses each transaction's events into one row, newest first", () => {
  const rows = groupPadala([...splitEvents, ...refundEvents]);
  expect(rows).toHaveLength(2);
  expect(rows.map((r) => [r.txHash, r.outcome, r.amountStroops])).toEqual([
    [REFUND, "refunded", "200000000"],
    [SPLIT, "split", "300000000"],
  ]);
});

it("ignores a malformed amount instead of showing it", () => {
  const rows = groupPadala([
    ev(tx("c"), 300, "RECEIVE", "deposit", { from: SENDER, amount: "1.5" }),
  ]);
  expect(rows[0]?.amountStroops).toBeNull();
});

const OTHER = `G${"O".repeat(55)}`;

it("counts a pay to the flow's fixed refund wallet as returned, even from another sender", () => {
  const events = [
    ev(tx("d"), 400, "RECEIVE", "deposit", { from: OTHER, asset: "USDC", amount: "250000000" }),
    ev(tx("d"), 400, "PAYOUT", "pay", { asset: "USDC", payment: "250000000", recipient: SENDER }),
    ev(tx("d"), 400, "PAYOUT", "route", { amount: "250000000", topic1: false }),
  ];
  expect(readPadala(events)).toEqual({
    from: OTHER,
    amountStroops: "250000000",
    outcome: "refunded",
    returnedTo: SENDER,
  });
});

it("only says 'returned to the sender' when it really went back to them", () => {
  expect(returnedTitle({ from: SENDER, returnedTo: SENDER })).toBe("Ibinalik sa nagpadala");
  expect(returnedTitle({ from: OTHER, returnedTo: SENDER })).toBe("Ibinalik sa GSSS…SSSS");
});

it("names the 30 USDC minimum as the reason only below it", () => {
  expect(returnedReason("200000000")).toBe("Kulang sa 30.00 USDC na minimum");
  expect(returnedReason("300000000")).toBe("Hindi pumasa sa kondisyon ng plano");
});
