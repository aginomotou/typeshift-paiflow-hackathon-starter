# Troubleshooting

### Symptom → what to check
| Symptom | What to check / do |
|---|---|
| Wrong Node version / unsupported engine | `node --version`; select Node 22 (`nvm use 22`), reopen terminal, retry `pnpm install` |
| pnpm missing or wrong version | `npm install --global pnpm@10.4.1`; `pnpm --version` must print `10.4.1` |
| Freighter missing / not connecting | Install/unlock in **this** browser; approve this site's access (Paiflow access ≠ localhost access); check active account and **Testnet** |
| No payment controls, or `403 PREPARATION_MODE` | Mode is `prepare` (or unset). Set server-only `PAIFLOW_MODE=team` in `.env.local` when permitted; **restart** `pnpm dev` |
| Configuration error, **401** or **404** | Check origin (`PAIFLOW_BASE_URL`, set explicitly — example file may have an old default), **confirmed deployment UUID** (not flow ID, not `C…` contract address), and an active `pfk_` token (`pfk_` + 64 lowercase hex) belonging to **that** deployment |
| Demo mode stops working at the venue | Demo tokens are limited to **3/hour per IP**, shared across venue Wi-Fi. Use team mode, which you need for qualification anyway |
| Insufficient funds / missing account | Friendbot-fund payer **and** recipients (an unfunded recipient account doesn't exist on-chain); leave XLM for fees and reserves |
| Missing trustline after switching to USDC | Every receiving wallet needs the exact USDC trustline (issuer `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`); payer also needs USDC funds (Friendbot is XLM only — swap in Freighter or Circle faucet) |
| **422** validation error | Read the message; check asset, amount, recipients and trigger type |
| **429** rate limit | Wait for `Retry-After`; stop repeated clicks and excessive polling |
| **PENDING**, timeout, or submission **502** | Preserve and resubmit the **same signed envelope** ("Check again"); check finality before creating any new payment |
| Preparation expired before signing | Dismiss old request, prepare again — but if submission was attempted, check its outcome first |
| **FAILED** | Read the confirmed failure reason and fix the cause before preparing another payment |
| Payment confirmed, feed not updated | Verify by transaction hash (Stellar Expert Testnet); let the feed catch up — don't pay again |
| Recipient balance looks wrong | If the recipient is also the payer, net change includes payment + fees. Use the transaction's payout evidence |
| Demo-mode payments working but "not ours" | Shared-demo transactions belong to another deployment and don't qualify. Use `team` mode with your own UUID/token |

Other flow types: a confirmed deposit can leave funds **held** (not paid out). For Split, verify the two expected payouts.

### API HTTP errors (`{ "error": { code, message, fields?, details? } }`)
| HTTP | Code | Do this |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing, malformed, unknown, expired, revoked **or wrong-deployment** token all give this. Check token and deployment UUID together. Don't loop on 401: repeated failures trigger stricter lookup limits |
| 402 | `INSUFFICIENT_FUNDS` | Fund the `from` account on testnet |
| 403 | `FORBIDDEN` / `PREPARATION_MODE` | Feature or caller unavailable (incl. disabled public demo, or a privileged starter route still denied by `lib/app-authorization.ts`). `PREPARATION_MODE` = starter mode is `prepare` |
| 404 | `NOT_FOUND` | Malformed or wrong deployment UUID, or not a confirmed deployment. Hosted pages also 404 when the flow lacks that contract type |
| 409 | `CONFLICT` | Check the operation's status and `Retry-After` before retrying (webhook: changed arguments under the same key) |
| 422 | `VALIDATION` | Fix input or the simulated flow; read `fields` and `message` (most chain prerequisites land here) |
| 429 | `RATE_LIMITED` | Wait for `Retry-After` |
| 500 | `INTERNAL` | Keep `x-request-id`, contact support |
| 502 | `UPSTREAM_RPC` | May already be broadcast. Retry the **same** envelope or poll events; never prepare a duplicate |
| — | `CONFIGURATION` (starter) | Team mode is missing or has invalid `PAIFLOW_BASE_URL`, `PAIFLOW_DEPLOYMENT_ID` or `PAIFLOW_API_TOKEN` |

Submission can return HTTP 200 with `status: "FAILED"`. Always read `data.status`.

### Exact simulation and transaction errors
| Message starts with | Fix |
|---|---|
| `TrustlineMissingError: The payout recipient has no trustline for {asset}…` | Recipient adds the exact trustline (code `USDC`, Circle issuer), then prepare again. The whole payment reverts, nothing is partly paid. Deploying only warns about this, so a successful deploy doesn't prove recipients are ready |
| `AccountMissingError: The account receiving {asset} doesn't exist on this network yet…` | Friendbot-fund the recipient, then add its trustline |
| `BalanceError: There isn't enough {asset} to cover this transfer.` | Top up the payer (or the funded contract) with the correct testnet asset |
| `Insufficient balance to cover this transaction…` | Check asset balance and XLM for fees and reserves |
| `txInsufficientBalance: The from account cannot cover the fee…` | Fund the signing account with testnet XLM |
| `txTooLate: The transaction's 180-second window expired…` | Prepare again and sign promptly (only after the old one is known not to have succeeded) |
| `txBadSeq: The from account's sequence number moved…` | The same wallet sent another transaction meanwhile. Wait for it, then prepare again |
| `txBadAuth: The envelope is not signed by the from account.` | Reconnect the selected customer's wallet; sign with the returned network passphrase |

### Payment safety rules (no duplicate payments)
- Ordinary Pay preparation is valid ~180 s (`expiresAt`). Unlock Freighter before pressing Pay.
- **Expired before signing, nothing submitted** → dismiss and prepare again.
- **Signing finished or submission may have started** → first check the original transaction's outcome. Create a new payment only after confirming the original failed or expired without being included on-chain.
- **Pending / timeout / 502** → may already be broadcast. Keep the tab open, use "Check again" with the same signed transaction. Don't prepare a duplicate because the result is uncertain.
- **Uncertain deployment confirmation** → check the existing deployment/transaction before starting another deployment.
- Switched customer account → "Refresh wallet" before paying.
- HTTP 200 is a transport result, not payment confirmation.

### Asking for help (support: paiflow+jru.hack@artisam.xyz)
Include: deployment UUID, transaction hash, error code/message, `x-request-id` if available.
Omit: API token, wallet secrets, signed envelopes.

### Never "fix" by
- Bypassing or deleting the mode guards in `lib/paiflow.ts`.
- Moving the token into browser code / `NEXT_PUBLIC_` vars.
- Switching to `demo` mode for submission evidence.
- Floating-point amount math instead of `lib/amount.ts`.
