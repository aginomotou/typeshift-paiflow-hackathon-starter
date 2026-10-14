import { fromStroops } from "@/lib/amount";

// Display-only formatting. String/bigint based; never floating point.
export function formatUsdc(stroops: string): string {
  const [whole = "0", fraction = ""] = fromStroops(stroops).split(".");
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${fraction.padEnd(2, "0")}`;
}
export const shortAddress = (address: string) =>
  `${address.slice(0, 4)}…${address.slice(-4)}`;
export const txLink = (hash: string) =>
  `https://stellar.expert/explorer/testnet/tx/${hash}`;
export const accountLink = (address: string) =>
  `https://stellar.expert/explorer/testnet/account/${address}`;

// Two-decimal display for balances (half-up), for reading at a glance.
// Show the exact formatUsdc value alongside it (e.g. as a title).
export function formatUsdc2(stroops: string): string {
  const cents = (BigInt(stroops) + 50_000n) / 100_000n;
  const whole = (cents / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${whole}.${(cents % 100n).toString().padStart(2, "0")}`;
}
