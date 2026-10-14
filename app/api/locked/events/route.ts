import { listEvents, requireLocked } from "@/lib/paiflow";
import { handle, InputError } from "@/lib/http";

// Activity for the locked deployment (held deposits and the timed release).
export async function GET(request: Request) {
  return handle(async () => {
    requireLocked();
    const params = new URL(request.url).searchParams;
    const cursor = params.get("cursor");
    const txHash = params.get("txHash");
    if (
      [...params.keys()].some((key) => key !== "cursor" && key !== "txHash") ||
      (cursor !== null && (!cursor || cursor.length > 512)) ||
      (txHash !== null && !/^[0-9a-f]{64}$/.test(txHash))
    )
      throw new InputError("Invalid cursor query.");
    return listEvents(
      { cursor: cursor ?? undefined, txHash: txHash ?? undefined },
      "locked",
    );
  });
}
