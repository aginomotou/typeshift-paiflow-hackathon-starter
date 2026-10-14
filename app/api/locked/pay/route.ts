import {
  prepareExecute,
  submitExecute,
  requireLocked,
  capabilities,
} from "@/lib/paiflow";
import { handle, paymentBody, InputError } from "@/lib/http";

// Locked padala: same execute path as /api/pay, pinned server-side to the
// locked deployment. The browser never chooses a deployment UUID.
export async function POST(request: Request) {
  return handle(async () => {
    requireLocked();
    const body = await paymentBody(request);
    if ((await capabilities("locked")).network !== "testnet")
      throw new InputError("Only Testnet transactions are allowed.");
    const preparationRequestId =
      request.headers.get("x-preparation-request-id") ?? undefined;
    return "signedXdr" in body
      ? submitExecute(body, true, preparationRequestId, "locked")
      : prepareExecute(body, "locked");
  });
}
