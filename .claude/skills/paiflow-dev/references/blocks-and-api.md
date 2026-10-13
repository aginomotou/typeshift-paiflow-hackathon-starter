# Blocks and API (developer context guide, `llms.md`)

Source: `llms.md` in the starter repo, updated Oct 12 2026, API checked against staging revision `9ae4172`. Testnet only.

### Model
- Paiflow deploys a canvas graph as connected Stellar Soroban contracts in one transaction. It is non-custodial: customers sign in their own wallets.
- The `/api/v1` API **drives an existing deployment**. It never creates flows or per-user copies. One deployment = one business or group; one subscription = one configured subscriber.
- Hackathon: Dev mode off, so per-payment recipients, Fill value via API, Dev values and **deferred subscriber/recipient setup** are unavailable. Configure everything before deploying.

### Graph rules
- Exactly one trigger (no incoming edges), at least one action, every node reachable, no cycles or dangling edges. Max **40 nodes / 80 edges**.
- Keep one asset along a path (Swap changes the downstream asset). Saving a draft doesn't mean it will deploy; deploy validation re-checks everything.
- Asset shapes: `{"kind":"native"}` (XLM), `{"kind":"known","symbol":"USDC"}`, `{"kind":"custom","code":"TOKEN","issuer":"G…"}`.
- Use real testnet `G…` addresses. `PENDING:<label>` is a placeholder, not payable. Never put an `S…` secret in a flow field.
- Money is an integer **stroop string**: 1 token = `"10000000"`; 10 USDC = `"100000000"`; 0.5 USDC = `"5000000"`. Use bigint. 1% = 100 bps; 100% = 10,000 bps. ISO times include a timezone (e.g. `2026-10-14T06:00:00Z`).

### Blocks
| Block | Key fields | Rules that bite |
|---|---|---|
| **On Receive** `on_receive` | `asset`, optional `minAmountStroops` | Customer deposit runs the flow. Use via execute (prepare → sign → submit) or the hosted trigger page. A plain token transfer to the contract does **not** trigger it. The minimum is only a floor for downstream Split |
| **On Schedule** `on_schedule` | `intervalAmount`, `intervalUnit` (minute/hour/day/week/month), `startsAt`, optional `endsAt`, `occurrences`, `timeZone`, `pauseAllowed`, `retrieveAllowed` | Pre-fund the stream on the trigger page; execute can't start it. `endsAt` beats `occurrences`; neither = 30-day window; month = 30 days. Pay needs `amountStroops` per interval; percentage Split needs `amountPerIntervalStroops`. No amount/time conditions under it |
| **HTTP Webhook** `web2_webhook` | `asset` | Server callback with `x-webhook-secret` makes the relayer pay from a pre-funded pool. Depositing only tops up. Not executable via v1 execute. Only `multisig` conditions |
| **Subscription** `subscription` | `asset`, `subscriber`, `amountPerPeriodStroops`, interval, optional end | Relayer pulls from the one configured subscriber after they approve an allowance on `/allowance/[id]`. Execute can't start it. No amount/time conditions |
| **Pay** `pay` | `recipient`, `asset`, `mode` fixed/percentage, `amountStroops` or `percentage`, `fullAmount` | `fullAmount: true` pays 100% of what arrives (simplest for variable checkout prices). A fixed Pay sends min(incoming, cap); surplus goes to the next step or **stays stuck** in a terminal Pay. `fillValueViaApi` needs Dev mode (unavailable) |
| **Split** `split` | `recipients` (≤20: `address`, `mode`, `bps` or `amountStroops`, optional `label`, `email`) | All rows same mode. Percentages > 0 and sum to exactly **10000** (three equal: 3333/3333/3334; remainder to the last). No duplicate addresses. Use Split for fan-out; don't draw several money edges. A percentage Split consumes the whole deposit |
| **Swap** `swap` | `assetIn`, `assetOut` (XLM↔USDC only), `slippageBps` (≥30, default 100), `deadlineSecs` (default 300) | Soroswap. Exactly one outgoing edge. Failure reverts the payment. Not under Schedule |
| **Condition** `condition` | `kind`: `amount_gt`/`amount_lt` (`amountStroops`), `time_before`/`time_after` (`at`), `multisig` (`signers`, `threshold`) | Amount/time need both True and False edges connected. Equality goes False. Time conditions **hold** funds until release. Before the deadline, the deploying wallet or `release-early` releases the before side; at/after, it auto-releases to the after side. All customers share one balance and deadline. Multisig has no v1 approval endpoint |
| **Hold** `hold` | none | Only directly on a time condition's before side. Makes it a strict lock: no early release |
| **Return to owner** `return_to_owner` | none | Terminal after a condition. Pays everything to the **wallet that signed deployment**, not to each customer. For refunds use an explicit Pay |
| Notifications | graph `notify: { mode: off / every_transaction / shortfalls_only, sendTo }` | A flow setting, not a block |

### Hosted pages (origin `https://beta.app.paiflow.xyz`, id = deployment UUID)
- `/trigger/[id]`: public payment or top-up page. `?amount=10` is a hint in tokens (not stroops); a fixed flow's amount overrides it.
- `/deployments/[id]/embed`: public read-only graph, live events and payment QR. No login or token. Good for showing payouts to judges.
- `/allowance/[id]`: the configured subscriber approves an allowance. It doesn't charge immediately.

### `/api/v1` essentials
- Auth: `Authorization: Bearer pfk_<64 lowercase hex>`. One token = one deployment, shown once. Success is `{ "data": … }`. Keep the `x-request-id` header for support.
- **Capabilities**: `GET /api/v1/deployments/:id/capabilities` shows which operations a deployment supports (`supported` / `conditional` / `unsupported`). It shows support, not live readiness.
- **Execute (prepare)**: `POST …/execute` with `{ "from": "G…", "amount": "100000000" }`. It simulates the whole pipeline and refuses missing prerequisites before signing. It returns `xdr`, `networkPassphrase`, `network`, `expiresAt` (**180 s**) and the header `x-history-request-id`. Require `network === "testnet"` and sign with the returned passphrase. Works only for deposit-trigger heads.
- **Submit**: `POST …/execute/submit` with `{ "signedXdr": "…" }`. Send `x-preparation-request-id` with every submit or retry. `?wait=true` (default) waits about 25 s. It returns `txHash`, `status` (`SUCCESS`/`PENDING`/`FAILED`), `ledger?`, `error?`. Retries are idempotent on the tx hash. At most 3 concurrent waiters per token.
- **Events**: `GET …/events?cursor&limit(1–100)&txHash`. It returns `{ items, nextCursor, hasMore }`, oldest first. Kinds include `RECEIVE`, `PAYOUT`, `STATUS_CHANGE`. Store `nextCursor` and pass it back unchanged; never send an empty `cursor=`. Drain while `hasMore`, then wait 10–30 s. Deduplicate by `eventId`. Events usually appear 10–20 s after the ledger closes, and polling faster doesn't help.
- **Release early**: `POST …/release-early` with `{ "nodeId": "<condition id>" }` (empty works if there's only one timelock). No customer signature: **the token alone authorises it**, so protect your route. After the deadline it returns 422.
- Other promoted endpoints (balances, swap-quote, funding, schedule state and controls, subscription state, cancel and reactivate) exist. Check capabilities, then use the live state endpoint. Hosted testnet acceptance of these wallet workflows is still **pending**.
- Webhook reward: `POST /api/webhooks/:id` with `x-webhook-secret`, `Idempotency-Key`, `{ "escrow": true, "amount": "<stroops>" }`. Reuse the same key and payload on every retry. HTTP 202 means PENDING or UNKNOWN, not paid. Changed arguments under the same key return 409.
- Public: `GET /api/v1/openapi.json`; `POST /api/v1/demo-token` gives a shared swap demo token for 60 min, **3/hour per IP**. Deposits to the demo go to a Paiflow-owned account.

| Endpoint | Limit (per token, 60 s window) |
|---|---|
| capabilities | 60 |
| execute, execute/submit | 30 each |
| events | 120 |
| release-early | 10 |

### Timing
- Schedule and subscription intervals should be **≥ 5 minutes**. Charges land 1–2 minutes after they're due, and 1-minute intervals drain testnet funds fast.
- The live feed can lag about a minute. Never pay again because an animation hasn't appeared.

### Worked examples (all one deployment, configured recipients)
- **Barkada splitter / tip jar**: On Receive USDC → Split 5000/5000. `prepareExecute({ from, amount: "100000000" })` → wallet signs → `submitExecute` → `listEvents`. Switch wallets to show 3 customers, not 3 deployments.
- **Campus Snacks** (`artisam-paiflow/paiflow-campus-snacks`): On Receive USDC → Split vendor 9000 / student org 1000. 3.50 USDC → 3.15 + 0.35. The server calculates prices. It rejects demo mode.
- **Sari-sari checkout**: On Receive USDC → Pay `fullAmount` to the store (or Split store/partner). The basket total becomes the amount. Mark it paid only on SUCCESS.
- **Freelance escrow**: On Receive USDC → `time_before` deadline. True → Pay full to the freelancer; False → Pay full to the client's configured wallet (not Return to owner). Don't use Hold. Accept delivery → authorised server calls `releaseEarly({ nodeId })`.
- **Group-buy pool**: On Receive USDC → `time_after` deadline. False → Hold; True → Return to owner. No early release. Explain in the pitch who controls the deploying wallet.
