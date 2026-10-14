import { expect, it } from "vitest";
import { shortDeployment, tokenHint } from "@/lib/token-hint";

it("names the right slot and deployment for a rejected token", () => {
  const msg = tokenHint(
    "UNAUTHENTICATED: A valid API token for this deployment is required",
    "main",
    "836e2b68",
  );
  expect(msg).toContain("main na padala");
  expect(msg).toContain("836e2b68");
  expect(msg).toContain("pnpm check:tokens");
  expect(tokenHint("UNAUTHENTICATED: x", "locked", null)).toContain("naka-lock na padala");
});

it("explains an empty main token, and stays out of unrelated errors", () => {
  expect(
    tokenHint("Team mode requires PAIFLOW_API_TOKEN and PAIFLOW_DEPLOYMENT_ID.", "main", null),
  ).toContain("Walang token");
  expect(tokenHint("Set PAIFLOW_MODE to prepare, demo or team.", "main", null)).toBeNull();
  expect(tokenHint("RATE_LIMITED: slow down", "locked", null)).toBeNull();
});

it("reads the short deployment id from the public URL", () => {
  expect(shortDeployment("https://x/deployments/836e2b68-c8ab-4a83-9180-720d56ebbc77")).toBe("836e2b68");
  expect(shortDeployment(null)).toBeNull();
});
