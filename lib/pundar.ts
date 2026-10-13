import "server-only";
import { PaiflowError } from "@/lib/paiflow";
import {
  SHARES,
  USDC_ISSUER,
  type PundarRecipient,
  type RecipientBalance,
} from "@/lib/pundar-split";

// Public testnet Horizon only. This reads public balances; it is not a Paiflow
// call and needs no token. Testnet is hard-coded so mainnet is never read.
const HORIZON = "https://horizon-testnet.stellar.org";
const ENV = {
  household: "PUNDAR_HOUSEHOLD_ADDRESS",
  student: "PUNDAR_STUDENT_ADDRESS",
  savings: "PUNDAR_SAVINGS_ADDRESS",
} as const;

// Public G-addresses of the three Split recipients, from server env.
// They are not secrets, but keep them server-configured so they match the flow.
export function pundarRecipients(): PundarRecipient[] | null {
  const recipients = SHARES.map((share) => ({
    ...share,
    address: process.env[ENV[share.key]]?.trim() ?? "",
  }));
  return recipients.every((r) => /^G[A-Z2-7]{55}$/.test(r.address))
    ? recipients
    : null;
}

function parseBalance(balance: string): string {
  const match = /^(\d+)\.(\d{7})$/.exec(balance);
  if (!match) throw new Error("Unexpected Horizon balance format.");
  return BigInt(`${match[1]}${match[2]}`).toString();
}

async function usdcBalance(address: string) {
  const response = await fetch(`${HORIZON}/accounts/${address}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (response.status === 404)
    return { status: "no_account" as const, balanceStroops: null };
  if (!response.ok) throw new Error(`Horizon ${response.status}`);
  const account = (await response.json()) as {
    balances: Array<{
      balance: string;
      asset_code?: string;
      asset_issuer?: string;
    }>;
  };
  const line = account.balances.find(
    (b) => b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER,
  );
  return line
    ? { status: "ok" as const, balanceStroops: parseBalance(line.balance) }
    : { status: "no_trustline" as const, balanceStroops: null };
}

export async function recipientBalances(): Promise<RecipientBalance[]> {
  const recipients = pundarRecipients();
  if (!recipients)
    throw new PaiflowError(
      503,
      {
        code: "CONFIGURATION",
        message:
          "Set PUNDAR_HOUSEHOLD_ADDRESS, PUNDAR_STUDENT_ADDRESS and PUNDAR_SAVINGS_ADDRESS to the Split recipients' public G-addresses.",
      },
      null,
      null,
    );
  try {
    return await Promise.all(
      recipients.map(async (r) => ({
        key: r.key,
        address: r.address,
        ...(await usdcBalance(r.address)),
      })),
    );
  } catch {
    throw new PaiflowError(
      502,
      {
        code: "BALANCES_UNAVAILABLE",
        message:
          "Could not read testnet balances right now. This does not affect payments; check the transaction link.",
      },
      null,
      null,
    );
  }
}
