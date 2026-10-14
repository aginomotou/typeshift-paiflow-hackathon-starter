import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

const MAIN_ID = "11111111-1111-4111-8111-111111111111";
const LOCK_ID = "22222222-2222-4222-8222-222222222222";
const MAIN_TOKEN = `pfk_${"a".repeat(64)}`;
const LOCK_TOKEN = `pfk_${"b".repeat(64)}`;
const from = `G${"A".repeat(55)}`;
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv("PAIFLOW_MODE", "team");
  vi.stubEnv("PAIFLOW_BASE_URL", "http://localhost:3000");
  vi.stubEnv("PAIFLOW_DEPLOYMENT_ID", MAIN_ID);
  vi.stubEnv("PAIFLOW_API_TOKEN", MAIN_TOKEN);
  vi.stubEnv("PUNDAR_LOCKED_DEPLOYMENT_ID", LOCK_ID);
  vi.stubEnv("PUNDAR_LOCKED_API_TOKEN", LOCK_TOKEN);
  vi.stubEnv("PUNDAR_LOCKED_UNLOCK_AT", "2026-10-14T07:40:00Z");
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it("exposes only public locked facts, never the token", async () => {
  const { lockedPublicConfig } = await import("@/lib/paiflow");
  const pub = lockedPublicConfig();
  expect(pub).toEqual({
    deploymentUrl: `http://localhost:3000/deployments/${LOCK_ID}`,
    unlockAt: "2026-10-14T07:40:00.000Z",
  });
  expect(JSON.stringify(pub)).not.toContain(LOCK_TOKEN);
});

it("hides the locked card when it is not configured or not in team mode", async () => {
  const { lockedPublicConfig } = await import("@/lib/paiflow");
  vi.stubEnv("PUNDAR_LOCKED_API_TOKEN", "");
  expect(lockedPublicConfig()).toBeNull();
  vi.stubEnv("PUNDAR_LOCKED_API_TOKEN", LOCK_TOKEN);
  vi.stubEnv("PAIFLOW_MODE", "prepare");
  expect(lockedPublicConfig()).toBeNull();
});

it("sends locked requests to the locked deployment with its own token", async () => {
  fetchMock.mockImplementation(async () =>
    Response.json({ data: { network: "testnet", items: [], nextCursor: null, hasMore: false } }),
  );
  const { GET } = await import("@/app/api/locked/events/route");
  expect((await GET(new Request("http://localhost/api/locked/events"))).status).toBe(200);
  const [url, init] = fetchMock.mock.calls[0]!;
  expect(String(url)).toContain(`/deployments/${LOCK_ID}/events`);
  expect(String(url)).not.toContain(MAIN_ID);
  expect((init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${LOCK_TOKEN}`);
});

it("refuses anything but execute recovery on the locked integration route", async () => {
  const { POST } = await import("@/app/api/locked/integration/route");
  const post = (body: unknown) =>
    POST(new Request("http://localhost/api/locked/integration", {
      method: "POST",
      body: JSON.stringify(body),
    }));
  expect((await post({ operation: "releaseEarly", phase: "prepare", input: {} })).status).toBe(422);
  expect((await post({ operation: "execute", phase: "submit", input: { xdr: "x" } })).status).toBe(422);
  expect((await post({ operation: "execute", phase: "reconcile", input: { xdr: "x", extra: "1" } })).status).toBe(422);
  expect(fetchMock).not.toHaveBeenCalled();
});

it("blocks locked payments in prepare mode with zero upstream calls", async () => {
  vi.stubEnv("PAIFLOW_MODE", "prepare");
  const { POST } = await import("@/app/api/locked/pay/route");
  const response = await POST(
    new Request("http://localhost/api/locked/pay", {
      method: "POST",
      body: JSON.stringify({ from, amount: "500000000" }),
    }),
  );
  expect(response.status).toBe(403);
  expect(fetchMock).not.toHaveBeenCalled();
});

it("keeps working when the MAIN token is missing (independent deployments)", async () => {
  vi.stubEnv("PAIFLOW_API_TOKEN", "");
  fetchMock.mockImplementation(async () =>
    Response.json({ data: { items: [], nextCursor: null, hasMore: false } }),
  );
  const { lockedPublicConfig } = await import("@/lib/paiflow");
  expect(lockedPublicConfig()).not.toBeNull();
  const { GET } = await import("@/app/api/locked/events/route");
  expect((await GET(new Request("http://localhost/api/locked/events"))).status).toBe(200);
  expect(String(fetchMock.mock.calls[0]![0])).toContain(LOCK_ID);
});
