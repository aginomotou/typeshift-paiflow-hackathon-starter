# Hackathon rules and ideas (JRU Event Primer)

### At a glance
| Item | Details |
|---|---|
| When/where | **Oct 14, 2026**, José Rizal University, 10:30 AM–6:00 PM PHT |
| Format | One-day, in-person, students |
| Teams | 10 teams of 1–4 |
| Dev time on the day | 4 hours + 1-hour lunch |
| Prize pool | PHP 10,000 (qualifying teams only; paid via QR Ph to the member named in the submission) |
| Network | Stellar **testnet** |
| Support | paiflow+jru.hack@artisam.xyz |

Building and integrating **before** the event is allowed (flow deployment, API integration, test payments) once team credentials are available. Boilerplate, open-source libs, the starter and AI tools are allowed. Oct 14 is for finishing, verifying payouts and preparing the demo.

### Schedule (PHT, Oct 14)
| Time | Activity |
|---|---|
| 10:30–12:30 | Dev part 1 — finish integration, verify a confirmed payout |
| 12:30–1:30 | Lunch + checkpoint (optional coding; check deployment/payout evidence) |
| 1:30–3:30 | Dev part 2 — complete integration, prepare demo |
| **3:00–3:30** | **Submission window — submit before 3:30 PM with deployment ID + payout transaction** |
| 3:30–4:30 | Pitching: 10 teams × 8 min (5 pitch+demo, 3 Q&A), random order drawn at 3:30 |
| 4:30–5:00 | Judging |
| 5:00–5:30 | Winners |
| 5:30–6:00 | Closing |

### Qualification
A **confirmed team deployment** and a **verifiable on-chain payout from it**, submitted (deployment ID + payout transaction) via the form by **3:30 PM PHT**. Shared-demo payments don't qualify. Non-qualifying teams may pitch but cannot rank or win.

### Scoring (averaged across judges)
- **Creativity 30%**
- **Integration 40%** — rewards **fit over block count**. "Works end to end" allows up to **10 points for a live demo** or **7 for a recording** of your actual app, deployment and verifiable payout.
- **Real-world usefulness 30%**

Pitch: strict 5 + 3 minutes. Set up during the previous team's Q&A. A recording may replace a failed live demo (7-point cap).

Strong projects: a real user, a flow that fits their problem, a demo with visible payouts.

### Challenge constraints
- Theme is open. Start from a real problem; choose blocks that fit.
- **Dev mode off all hackathon**: no per-payment recipients, no Fill value via API, no Dev values. Configure recipients/required values before deploying. Standard Pay and Split remain available.
- **Set up Paiflow once per business/group/branch.** Example: *Campus Snacks* = one snack-shop branch; every customer pays separately into the same setup (90% shop, 10% student org). If your idea needs a separate setup per customer, present that as a future feature.
- **Confirm feature availability with support before choosing an idea.**

### Idea → blocks (from the Primer)
| Idea | What it does | Paiflow pieces | Risk note (paiflow dev) |
|---|---|---|---|
| Barkada bill splitter | Friend pays their share; money goes to friends who paid group expenses | `on_receive` + `split`, QR trigger page | Low — but recipients are fixed at deploy time; one deployment per group/trip |
| Org dues & event tickets | QR payments split between org treasury and venue | `on_receive` + `split`, embed + live feed | Low — closest to the Guide's walkthrough |
| Creator collab tip jar | Tips split among collaborators at agreed % | `on_receive` + `split` | Low |
| Sari-sari store checkout | Customer scans and pays; supplier's share sent immediately | `on_receive` + `split` or `pay` | Low |
| Transparent donation drive | Donations split among beneficiaries with a public payout feed | `on_receive` + `split`, embed + live feed | Low — the feed adds visible proof |
| Freelance deadline escrow | Client pays upfront; acceptance before deadline pays freelancer, else refund | `on_receive` + `condition (time_before)` + two `pay` branches | Medium — execute path + `releaseEarly` exist; but one shared deadline/balance for all customers, and you must implement `lib/app-authorization.ts` |
| Group-buy pool (from `llms.md`) | Contributions locked until a deadline, then all go to the organiser | `on_receive` + `condition (time_after)`; before → `hold`, after → `return_to_owner` | Medium — no early release; demo must wait for the deadline; money goes to the deploying wallet |
| Digital baon | Parent sets up scheduled weekly allowance | `on_schedule` + `pay` | Higher — stream must be pre-funded via the trigger page; payments land 1–2 min late; use ≥5-minute intervals; new wallet workflows not yet live-rehearsed |
| Tutor/club subscription | Configured member approves an allowance for recurring charges | `subscription` + allowance page | Higher — **one** configured subscriber per deployment, fixed at deploy (no deferred subscriber with Dev mode off) |
| Rewards from a Web2 app | Pre-funded pool pays a recipient when an app reports a completed goal | `web2_webhook` + authenticated callback + `pay` or `split` | Higher — pool pre-funding, server secret, idempotency keys, app authorization; not an execute flow |

The "risk note" column is the paiflow dev's assessment, not from the Primer: "low" = buildable entirely from the documented On Receive execute path with configured recipients and Dev mode off.

### What to prepare and bring
- Node.js 22, pnpm 10.4.1 (installed via npm), Git, Freighter, a GitHub account; `pnpm install` done in the starter.
- Funded testnet wallets. USDC needs its exact trustline and separate funding; Friendbot is XLM only.
- Your own internet (mobile data/hotspot). On-site wallet/funding support exists; organiser fallback wallets are last resort — never use them for real funds or import them into a real-money wallet.

### Shared rules
- Use Paiflow for the core money flow. Testnet only; no real funds.
- API tokens server-side; wallet secrets out of the app.
- No API/relayer load-testing or spam; rate limits apply.
- Organisers decide disputes. The beta app collects PostHog analytics.
- Resources: the starter, the Campus Snacks sample and its live app.
