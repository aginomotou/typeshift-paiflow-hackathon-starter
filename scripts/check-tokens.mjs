// pnpm check:tokens
// Checks every deployment slot in .env.local against Paiflow (read-only:
// GET capabilities). Prints which slot works and, for a rejected token, which
// configured deployment it actually belongs to. Never prints a token.
import { readFileSync } from "node:fs";

const file = new URL("../.env.local", import.meta.url);
let text = "";
try {
  text = readFileSync(file, "utf8");
} catch {
  console.error("No .env.local found next to package.json.");
  process.exit(1);
}
const env = {};
for (const line of text.split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const origin = (env.PAIFLOW_BASE_URL || "https://beta.app.paiflow.xyz").replace(/\/$/, "");
const slots = [
  { name: "main", idKey: "PAIFLOW_DEPLOYMENT_ID", tokenKey: "PAIFLOW_API_TOKEN" },
  { name: "locked", idKey: "PUNDAR_LOCKED_DEPLOYMENT_ID", tokenKey: "PUNDAR_LOCKED_API_TOKEN" },
].filter((s) => env[s.idKey] || env[s.tokenKey]);

const short = (id) => (id ? `${id.slice(0, 8)}…` : "(none)");
const tail = (t) => (t ? `…${t.slice(-4)}` : "(empty)");

async function works(id, token) {
  if (!id || !/^pfk_[a-f0-9]{64}$/.test(token ?? "")) return { ok: false, status: "invalid-format" };
  try {
    const res = await fetch(`${origin}/api/v1/deployments/${id}/capabilities`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15_000),
    });
    const body = await res.json().catch(() => ({}));
    return {
      ok: res.ok,
      status: res.ok ? `200 ${body?.data?.network ?? ""}` : `${res.status} ${body?.error?.code ?? ""}`,
      requestId: res.headers.get("x-request-id"),
    };
  } catch (e) {
    return { ok: false, status: `network error (${e.name})` };
  }
}

console.log(`Paiflow: ${origin}   mode: ${env.PAIFLOW_MODE || "prepare"}\n`);
let allOk = true;
for (const slot of slots) {
  const id = env[slot.idKey];
  const token = env[slot.tokenKey];
  const r = await works(id, token);
  if (r.ok) {
    console.log(`✓ ${slot.name.padEnd(6)} ${slot.tokenKey} ${tail(token)} works for ${short(id)}`);
    continue;
  }
  allOk = false;
  console.log(`✗ ${slot.name.padEnd(6)} ${slot.tokenKey} ${tail(token)} → ${short(id)}: ${r.status}${r.requestId ? ` (x-request-id ${r.requestId})` : ""}`);
  // Is it a token for one of the OTHER configured deployments?
  for (const other of slots) {
    if (other === slot || !env[other.idKey]) continue;
    const x = await works(env[other.idKey], token);
    if (x.ok)
      console.log(`    ↳ this token belongs to the ${other.name} deployment (${short(env[other.idKey])}). Move it to ${other.tokenKey}.`);
  }
  if (!token) console.log(`    ↳ empty. Create a token on ${origin}/deployments/${id ?? "<id>"} (API access) and paste it into ${slot.tokenKey}.`);
  else
    console.log(`    ↳ fix: on ${origin}/deployments/${id} → API access, create a token (as the account that deployed it) and put it in ${slot.tokenKey}. Revoked tokens stay rejected.`);
}
console.log(allOk ? "\nAll deployment tokens work. Restart pnpm dev if you changed .env.local." : "\nFix the ✗ lines, then restart pnpm dev.");
process.exit(allOk ? 0 : 1);
