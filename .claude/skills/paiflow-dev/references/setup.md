# Setup and integration (Paiflow Guide)

Example used throughout: a customer's XLM payment automatically splits **90% to a shop, 10% to a community fund**.

### Contents
1. What you need
2. Testnet wallets
3. Build a Receive → Split flow
4. Review and deploy
5. Hosted-page payment
6. Deployment API token
7. Starter in preparation mode
8. Configure your deployment (team mode)
9. Payment from your app
10. Replace screens with your idea
11. "Ready" checklist
12. Other resources

---

### 1. What you need
| Need | Purpose |
|---|---|
| Paiflow | Build, deploy, inspect flows |
| Full/team Paiflow account | Create deployment API tokens (**sandbox accounts cannot** create tokens or connect to your app via the partner API; sandbox is for practising flows and test payments) |
| Freighter | Connect wallets, approve testnet transactions |
| Dedicated testnet wallets | Deploy, pay, receive the split |

Paiflow = the money logic. Your app decides **who pays and why**; the flow decides **when money moves and where it goes**. One deployment serves one business/group and receives payments from many customers.

**Dev mode is disabled for the whole hackathon.** Per-payment recipients, Fill value via API and Dev values are unavailable. Standard Pay and Split flows remain available. Configure recipients and required values before deploying.

### 2. Testnet wallets
1. Install the Freighter extension in the browser you'll use for Paiflow **and** your local app. Set up, switch to **Stellar Testnet**.
2. Create a dedicated testnet account; fund with testnet XLM via Freighter's **Friendbot** option.
3. Add the Circle testnet USDC trustline — asset code `USDC`, issuer:
   `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`
   A trustline only enables receiving; it gives no balance.
4. Freighter → **Swap** a small amount of XLM → that USDC. Keep some XLM for fees/reserves. No quote? Use the Circle testnet faucet.
5. Make a secondary wallet the same way (Testnet, Friendbot, USDC trustline). Make as many as needed.

Friendbot supplies **XLM only**. Never paste a secret key or recovery phrase into Paiflow, an app, an AI prompt or a repo. Testnet funds have no real value.

### 3. Build a Receive → Split flow
1. Open Paiflow, log in (or use sandbox to practise).
2. Create a flow: trigger **On Receive**, action **Split**, connect them.
3. Asset: **native XLM**. Dev mode off. Remove unrelated blocks and default recipients.
4. Two percentage recipients, using real funded public addresses:

| Recipient | % | Share of 1 XLM |
|---|---|---|
| Shop | 90% | 0.9 XLM |
| Community fund | 10% | 0.1 XLM |

Shares must total 100%. Graph/API uses basis points: 90% = 9000, 10% = 1000. Replace every placeholder address.

**Checkpoint:** one trigger, connected Split, XLM throughout, two real recipients. You're modelling one shop's rules, not a contract per customer.

### 4. Review and deploy
1. Open deployment review; read the English preview — confirm it says receive XLM and pay the two recipients at the intended percentages.
2. Connect the funded deployer wallet; confirm Freighter is on Testnet.
3. Start deployment; in Freighter review network, source account, contract operations and fee, then confirm.
4. Wait for **CONFIRMED**, open the deployment page.

Copy the **deployment UUID**. It is NOT the flow ID and NOT the Stellar contract address (starts with `C`). API calls use the deployment UUID.

**Checkpoint:** confirmed deployment, correct asset/recipients. Deployment alone doesn't prove payments work. If confirmation is uncertain, check the existing deployment/transaction before deploying again.

### 5. Hosted-page payment
1. Open the hosted payment page / QR link: `/trigger/YOUR_DEPLOYMENT_UUID` on the Paiflow site.
2. Connect the funded **customer** wallet (check the shown address if you switched accounts).
3. Enter 1 XLM, review, approve the Testnet transaction in Freighter.
4. Wait for confirmation; inspect live activity and transaction evidence.

Expected: 0.9 XLM → shop, 0.1 XLM → fund. Fees are on top of the 1 XLM. If a recipient is also the payer, its net balance includes payment and fees — use payout evidence, not balance.

**Checkpoint:** save the transaction hash; verify payouts (Stellar Expert Testnet). A slow feed is not failure — check the existing transaction before paying again.

### 6. Deployment API token
1. On the deployment page, signed in as owner → **API access** → create token, copy immediately (shown once).
2. Keep it with the confirmed deployment UUID for the starter's server config.

| Value | Recognise it |
|---|---|
| Deployment UUID | UUID of confirmed deployment; not flow ID or contract address |
| API token | Begins with `pfk_`; belongs to this deployment |
| Customer address | Public `G…` address from the customer's connected wallet |

Token stays server-side: no browser code, no `NEXT_PUBLIC_` vars, screenshots or public repos. If exposed: revoke, issue replacement. Customers sign in their own wallets; your server never needs their secret keys.

### 7. Starter in preparation mode
Requirements: **Node.js 22** (package.json: `>=22 <23`), **pnpm 10.4.1** (pinned), Git.

```bash
# macOS/Linux (after installing nvm, reopen terminal)
nvm install 22
nvm use 22          # run in every new terminal
node --version      # must start with v22.
```
Windows: install 22.x from official Node.js downloads, reopen terminal, check `node --version`.

```bash
git clone https://github.com/artisam-paiflow/paiflow-hackathon-starter.git
cd paiflow-hackathon-starter
npm install --global pnpm@10.4.1
pnpm --version      # must print 10.4.1
pnpm install
cp .env.example .env.local   # on Windows, copy in your editor
pnpm dev
```
Open http://localhost:3000.

`PAIFLOW_MODE=prepare` (default when unset): non-payment screens only; no upstream Paiflow requests; wallet actions, payments and event polling disabled. Payment/payout/event routes return **403 PREPARATION_MODE** — expected in this mode.

**Checkpoint:** app opens locally; non-payment screens work. Keep the mode guards.

### 8. Configure your deployment (team mode)
Stop the dev server, edit `.env.local`:
```
PAIFLOW_MODE=team
PAIFLOW_BASE_URL=https://beta.app.paiflow.xyz
PAIFLOW_DEPLOYMENT_ID=YOUR_CONFIRMED_DEPLOYMENT_UUID
PAIFLOW_API_TOKEN=YOUR_DEPLOYMENT_API_TOKEN
```
- If organisers give a different API origin, use it. The copied example may have an older default — set `PAIFLOW_BASE_URL` explicitly.
- Restart `pnpm dev` after any config change.

| Mode | Meaning |
|---|---|
| `prepare` | Non-payment screens only; default when unset |
| `team` | Your deployment + server-side token |
| `demo` | Optional shared XLM demo where enabled/permitted — **does not demonstrate your integration and doesn't qualify** |

An empty token does not auto-select demo mode. `.env.local` must be git-ignored; never commit it. Missing/invalid team config disables integration with an error — fix UUID/token/origin, don't bypass the guards.

### 9. Payment from your app
1. Open the local starter in the browser that has Freighter. Confirm team mode and that the deployment uses XLM.
2. **Connect Freighter** and approve access to the local site (approving Paiflow does not grant your localhost access).
3. Confirm customer address and Testnet. Enter `1` in the ordinary **Pay** amount field → **Pay**. The per-payment recipient form is hidden when deployment capabilities don't support it (Dev mode off).
4. Review and confirm the Freighter signing request. Starter prepares via its server → Freighter signs → server submits.
5. Check **SUCCESS**, verify 0.9/0.1 payout, save the hash.

Amounts are decimal units of the flow's input asset; internally 1 XLM = integer string `"10000000"`. Use `lib/amount.ts` (bigint). No floating-point money.

**Sign promptly:** ordinary Pay preparation is valid ~**180 seconds** (`expiresAt`). Unlock Freighter before pressing Pay. See `references/troubleshooting.md` for expired/pending/502 handling.

If you switch customer accounts, press **Refresh wallet** before paying again.

### 10. Replace screens with your idea
| File | Role |
|---|---|
| `components/starter-app.tsx` | Customer UI — replace with your checkout/dues/donation UX |
| `app/page.tsx` | Server page wrapper and config readiness |
| `lib/paiflow.ts` | Server-only Paiflow client and mode guards |
| `lib/amount.ts` | Exact decimal ↔ stroops conversion |

Request path: **browser → your server → Paiflow → customer wallet signature → your server → Paiflow submission.** Send unsigned preparation data to the browser for signing; keep the bearer token on the server. HTTP 200 = transport result, not payment confirmation — inspect transaction status and expected payout.

Store deployment UUID + transaction hash with each payment record. Associate feed activity by transaction hash; deduplicate by `eventId`. Add your own authorisation before exposing privileged payout or early-release routes.

Subscriptions, schedules, escrow, webhooks, per-payment recipients → see `references/blocks-and-api.md` (condensed from `llms.md`). Different funding, consent and execution requirements; not interchangeable with simple Receive.

### 11. "Ready" checklist
- Confirmed XLM Receive → Split deployment with real recipient addresses.
- A hosted-page payment **and** a starter-app payment with verifiable payouts.
- Deployment UUID and payment transaction hashes saved.
- Server-only API credentials; no wallet secrets in the app.
- Clear UI for success, pending and failure.

### 12. Other resources (point teammates to them; `llms.md` and the starter repo are condensed in References D and E)
| Resource | Use for |
|---|---|
| API quickstart | Integrating your own app without the starter (full frontend/backend example) |
| Full API reference | Endpoint schemas, errors, limits, pagination, advanced workflows |
| OpenAPI JSON | Import the API contract into dev tools |
| Postman collection | Try requests with deployment UUID + token |
| `llms.md` (AI developer context) | Product rules, API details, worked examples — subscriptions, schedules, escrow, webhooks |
| Starter repository | Working preparation, Freighter signing, submission, event reads |
| Freighter Testnet setup video | Wallet creation, Testnet, funding |
| Stellar Expert Testnet | Inspect transactions, verify payouts |
