# The starter repo (`artisam-paiflow/paiflow-hackathon-starter`, commit f7e93ca, Oct 12 2026)

Stack: Next.js 15, React 19, `@stellar/freighter-api` 6, `@stellar/stellar-sdk` 17 (server-only), Vitest. No database, UI or state library. Node `>=22 <23`, `packageManager: pnpm@10.4.1`.

### Scripts
`pnpm dev` · `pnpm typecheck` · `pnpm test` · `pnpm build`. After edits, AGENTS.md requires `pnpm typecheck`, then `pnpm build && pnpm test`, then checking `.next/static` for credential leaks (`pfk_`, `PAIFLOW_API_TOKEN`, your token).

### `.env.example`
```
PAIFLOW_MODE=prepare
PAIFLOW_BASE_URL=https://beta.app.paiflow.xyz
PAIFLOW_API_TOKEN=
PAIFLOW_DEPLOYMENT_ID=
# PAIFLOW_WEBHOOK_SECRET=   (optional, server-only)
```
Invalid mode values disable integration. Restart after changing anything. A pending payment submitted before a mode change can still execute.

### File map
| Path | Purpose |
|---|---|
| `components/starter-app.tsx` | Customer UI. **Replace this with your idea** |
| `components/deployment-panels.tsx` | Reusable panels: Funding, Schedule, Subscription, Balances, Swap quote, Early release, Webhook setup. Optional extension points |
| `app/page.tsx` | Server page wrapper, config readiness |
| `app/api/pay/route.ts` | Execute prepare/submit (requires integration mode, testnet only) |
| `app/api/events/route.ts` | Event feed |
| `app/api/payout/route.ts` | Older payout route; needs app authorization |
| `app/api/integration/route.ts` | Allowlisted adapter for capabilities and panel operations; rejects cross-origin mutations; no arbitrary proxy |
| `lib/paiflow.ts` | **Server-only** client and mode guards: `requireIntegration`, `prepareExecute`, `submitExecute`, `reconcileExecute`, `listEvents`, `releaseEarly`, `capabilities`, `balances`, `transactionStatus`, `swapQuote`, funding/schedule/subscription/allowance helpers, `webhookReward` |
| `lib/app-authorization.ts` | `applicationAuthorized()` **returns false by default**, which denies `releaseEarly`, `payout`, `webhook` and `schedule.*`. Replace it with real session, role and ownership checks before enabling those controls |
| `lib/amount.ts` | `toStroops` / `fromStroops` (bigint, max 7 decimals, i128 bound) |
| `lib/wallet.ts` | `connectWallet`, `refreshWallet`, `signPrepared` (Freighter) |
| `lib/browser-api.ts`, `lib/http.ts` | Browser fetch wrapper (retry delay, diagnostics), server route handler |
| `lib/hooks/use-wallet-operation.ts`, `lib/recovery.ts` | Recovery records in browser storage (intent, envelope, hash), Web Locks across tabs |
| `lib/hooks/use-activity.ts` | Paginated event polling (5 s while visible, honours `Retry-After`, deduplicates by `eventId`) |
| `lib/api-types.ts` | Typed API shapes |
| `llms.md`, `AGENTS.md` | Developer context and coding rules. Read these first in the repo |

### AGENTS.md rules (follow them when you edit the repo)
- Call Paiflow only through `lib/paiflow.ts`; never use `NEXT_PUBLIC_` for config and never return tokens to the browser.
- Never handle a customer secret key. Freighter signs with the prepared passphrase. Refuse mainnet.
- Use `lib/amount.ts` for money.
- Keep signed envelopes for PENDING or uncertain results, and retry the same one.
- Privileged actions go through the deny-by-default authorizer.
- Persist the intent before signing and the exact envelope before submitting. Never log recovery records. Don't clear PENDING or UNKNOWN records by timeout. Fail closed on storage errors.
- Webhook rewards: persist one stable key and payload per verified task before sending.

### Behaviour worth knowing
- **Check again** after reload: recovery survives reload in the same browser. Don't clear browser storage or switch browsers to "unstick" a payment; give support the deployment ID, tx hash and preparation request ID (never the signed envelope).
- To simulate another customer, switch the Freighter account and press **Refresh wallet** (window focus also refreshes).
- Demo mode caches its token in server memory. Restarts or extra server instances use up the 3/hour/IP quota.
- Read-only staging checks passed on 2026-10-12. **Live signed testnet acceptance of Schedule, Subscription, Webhook and early-release workflows is pending**, so don't present them as fully rehearsed.
