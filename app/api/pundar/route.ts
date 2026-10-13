import { requireIntegration } from "@/lib/paiflow";
import { handle } from "@/lib/http";
import { recipientBalances } from "@/lib/pundar";

export const dynamic = "force-dynamic";

// Read-only: USDC balances of the three fixed Split recipients. No user input.
export async function GET() {
  return handle(async () => {
    requireIntegration();
    return {
      balances: await recipientBalances(),
      readAt: new Date().toISOString(),
    };
  });
}
