import {
  capabilities,
  executeHash,
  reconcileExecute,
  requireLocked,
} from "@/lib/paiflow";
import { handle, InputError } from "@/lib/http";

// Recovery for locked padala only: recompute the original hash, or check the
// original envelope's status on the LOCKED deployment. Same body shape the
// wallet-operation hook sends to /api/integration for execute.
export async function POST(request: Request) {
  return handle(async () => {
    requireLocked();
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      throw new InputError("Expected JSON.");
    }
    const outer = (raw ?? {}) as Record<string, unknown>;
    const input = (outer.input ?? {}) as Record<string, unknown>;
    if (
      Object.keys(outer).some((k) => !["operation", "phase", "input"].includes(k)) ||
      outer.operation !== "execute" ||
      !["prepare", "reconcile"].includes(String(outer.phase)) ||
      typeof input !== "object" ||
      Object.keys(input).some((k) => k !== "xdr") ||
      typeof input.xdr !== "string" ||
      !input.xdr ||
      input.xdr.length > 200_000
    )
      throw new InputError("Invalid operation.");
    if ((await capabilities("locked")).network !== "testnet")
      throw new InputError("Only Testnet deployments are allowed.");
    return outer.phase === "prepare"
      ? { txHash: executeHash(input.xdr) }
      : reconcileExecute(input.xdr, "locked");
  });
}
