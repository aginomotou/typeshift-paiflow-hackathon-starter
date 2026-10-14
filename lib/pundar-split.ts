// PUNDAR's agreed family plan. Safe for browser and server: no secrets here.
// It MUST match the deployed Paiflow Split block exactly (same order, same bps).
// Changing it here does not change the deployed flow; that needs a new deployment.

// Circle testnet USDC. A trustline to any other issuer's "USDC" will not work.
export const USDC_ISSUER =
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

// The deployed flow's Condition: 30 USDC and up goes to the Split; anything
// smaller is paid straight back to the sender. Must match the deployment.
export const MIN_PADALA_STROOPS = "300000000"; // 30 USDC

export const SHARES = [
  {
    key: "household",
    label: "Household",
    tl: "Pang-bahay",
    who: "Guardian (hal. si Mama)",
    note: "Pagkain, kuryente, renta.",
    bps: 6000,
  },
  {
    key: "student",
    label: "School allowance",
    tl: "Baon sa eskwela",
    who: "Estudyante",
    note: "Tuition at pang-araw-araw na baon.",
    bps: 1500,
  },
  {
    key: "savings",
    label: "OFW savings",
    tl: "Ipon ng OFW",
    who: "OFW lang ang may hawak",
    note: "Para sa pag-uwi balang araw.",
    bps: 2500,
  },
] as const;
export type ShareKey = (typeof SHARES)[number]["key"];

export type PundarRecipient = (typeof SHARES)[number] & { address: string };
export type RecipientBalance = {
  key: ShareKey;
  address: string;
  status: "ok" | "no_trustline" | "no_account";
  balanceStroops: string | null;
};

// Expected payout per share, in stroops. Paiflow assigns the rounding
// remainder to the last recipient, so savings gets whatever is left.
export function expectedSplit(amountStroops: string): Record<ShareKey, string> {
  const amount = BigInt(amountStroops);
  let assigned = 0n;
  const out = {} as Record<ShareKey, string>;
  SHARES.forEach((share, i) => {
    const value =
      i === SHARES.length - 1
        ? amount - assigned
        : (amount * BigInt(share.bps)) / 10_000n;
    assigned += value;
    out[share.key] = value.toString();
  });
  return out;
}
