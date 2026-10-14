// Plain-language setup hints for the two deployment slots in .env.local.
// They name the slot and the deployment, never a token value.
export type Slot = "main" | "locked";

// Browser-safe: no env var names here, so the .next/static credential scan
// stays meaningful. `pnpm check:tokens` names the exact .env.local key.
const SLOT: Record<Slot, { what: string }> = {
  main: { what: "main na padala" },
  locked: { what: "naka-lock na padala" },
};

export const shortDeployment = (deploymentUrl: string | null | undefined) =>
  /\/deployments\/([0-9a-f]{8})/i.exec(deploymentUrl ?? "")?.[1] ?? null;

// Returns a specific fix when the error is a rejected token or a missing
// token; otherwise null so the caller shows its usual message.
export function tokenHint(
  error: string,
  slot: Slot,
  deploymentId: string | null,
): string | null {
  const s = SLOT[slot];
  const where = deploymentId ? ` (${deploymentId}…)` : "";
  if (/UNAUTHENTICATED|valid API token/i.test(error))
    return `Tinanggihan ng Paiflow ang token ng ${s.what}${where}. Gumawa ng token sa page ng deployment na iyon (API access) gamit ang account na nag-deploy nito; gumagana lang ang token sa deployment kung saan ito ginawa. Patakbuhin ang "pnpm check:tokens" para makita kung aling linya sa .env.local ang aayusin, saka i-restart ang pnpm dev.`;
  if (/requires .*TOKEN/i.test(error))
    return `Walang token ang ${s.what}${where} sa .env.local. Patakbuhin ang "pnpm check:tokens" para makita kung saan ito ilalagay, saka i-restart ang pnpm dev.`;
  return null;
}
