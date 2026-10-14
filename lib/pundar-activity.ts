import type { EventItem } from "@/lib/paiflow";
import { formatUsdc, shortAddress } from "@/lib/format";
import { MIN_PADALA_STROOPS } from "@/lib/pundar-split";

// One deposit emits several events in the same transaction: RECEIVE·deposit,
// then the branch payout (PAYOUT·payout for the Split, PAYOUT·pay for the
// below-minimum Pay) and PAYOUT·route for the Condition's decision. Group them
// so each padala is one row, and read the outcome from what actually paid out.
// A refund is still an on-chain SUCCESS, so status alone can't say "split".
//
// The refund Pay pays a wallet fixed at deploy time (Dev mode is off), not
// whoever sent. So "returned" records who actually received it: the sender
// only when the sender is that configured wallet.
export type PadalaOutcome = "split" | "refunded" | "unknown";
export type Padala = {
  txHash: string;
  ledger: number;
  occurredAt: string;
  from: string | null;
  amountStroops: string | null;
  outcome: PadalaOutcome;
  returnedTo: string | null;
};

const record = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : {};
const text = (v: unknown) => (typeof v === "string" ? v : null);

export function readPadala(events: EventItem[]): Omit<Padala, "txHash" | "ledger" | "occurredAt"> {
  const deposit = record(events.find((e) => e.topic === "deposit")?.data);
  const amount = text(deposit.amount);
  const base = {
    from: text(deposit.from),
    amountStroops: amount && /^\d+$/.test(amount) ? amount : null,
  };
  if (events.some((e) => e.topic === "payout"))
    return { ...base, outcome: "split", returnedTo: null };
  const pay = events.find((e) => e.topic === "pay");
  if (pay)
    return {
      ...base,
      outcome: "refunded",
      returnedTo: text(record(pay.data).recipient),
    };
  return { ...base, outcome: "unknown", returnedTo: null };
}

export const padalaOutcome = (events: EventItem[]): PadalaOutcome =>
  readPadala(events).outcome;

export function groupPadala(events: EventItem[]): Padala[] {
  const byTx = new Map<string, EventItem[]>();
  for (const e of events) byTx.set(e.txHash, [...(byTx.get(e.txHash) ?? []), e]);
  return [...byTx.entries()]
    .map(([txHash, list]) => ({
      txHash,
      ledger: Math.max(...list.map((e) => e.ledger)),
      occurredAt: list[0]?.occurredAt ?? "",
      ...readPadala(list),
    }))
    .sort((a, b) => b.ledger - a.ledger);
}

const MIN_USDC = formatUsdc(MIN_PADALA_STROOPS);

// Says where a returned padala actually went: the sender only if the
// flow's fixed refund wallet is the sender's own wallet.
export function returnedTitle(p: Pick<Padala, "from" | "returnedTo">) {
  if (p.returnedTo && p.from && p.returnedTo === p.from)
    return "Ibinalik sa nagpadala";
  return p.returnedTo
    ? `Ibinalik sa ${shortAddress(p.returnedTo)}`
    : "Ibinalik sa nagpadala";
}
export function returnedReason(amountStroops: string | null) {
  return amountStroops && BigInt(amountStroops) < BigInt(MIN_PADALA_STROOPS)
    ? `Kulang sa ${MIN_USDC} USDC na minimum`
    : "Hindi pumasa sa kondisyon ng plano";
}
