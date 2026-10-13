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
