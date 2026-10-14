# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: hackathon judges.** They watch a five-minute pitch and live demo and need to understand the problem, the mechanism and the proof within seconds. Many read English more comfortably than Tagalog, so clarity for them comes first.

**Then OFW families**, in three roles:

- **OFW (sender):** works abroad and sends one remittance each payday from a Freighter wallet (`/send`). Wants to know that tuition is covered and that their own savings grow without having to ask.
- **Household guardian (Pang-bahay, e.g. Mama):** receives the household share and watches the family's balances and activity (`/family`).
- **Student (Estudyante):** receives the school-allowance share in their own wallet (`/family`).

## Product Purpose

Pundar splits every OFW remittance on arrival into fixed shares that go straight to different people: 60% household, 15% school allowance, and 25% savings in a wallet only the OFW controls. The family agrees on the plan once, and every remittance follows it. Success in the demo looks like this: the OFW sends 100 USDC once, all three balances move to 60 / 15 / 25 at the same moment, and the transaction link is on screen.

Tagline: "Bawat padala, may plano."

## Positioning

Today the whole remittance goes to one relative, and alternatives like INGAT split it into buckets that one person still holds. Pundar sends each share straight to the person it's for, including the OFW's own savings, under a plan nobody can quietly change: changing the split needs a new, visible deployment.

## Operating Context

- Setup happens once: the family agrees on the split on a video call, then one Paiflow deployment (On Receive USDC → Split) is created for that family.
- On payday the OFW sends a single USDC payment, signed in the browser with Freighter on Stellar testnet. Paiflow splits it in one transaction, and the family can see a receipt in the shared activity list.
- The demo is live, in front of judges, with a recorded fallback.

## Capabilities and Constraints

- Next.js 15 / React 19 app built on the Paiflow hackathon starter. Routes: landing `/`, `/register`, `/login`, `/send` (OFW), `/family` (household and student).
- **Testnet only; no real money.** Mainnet is refused. Cash-out to pesos is not built.
- The split is fixed at 60/15/25 basis points (`lib/pundar-split.ts`) and must match the deployed Split block. Paiflow Dev mode is off for the event, so there are no per-payment recipients or amounts.
- Every recipient needs the Circle testnet USDC trustline. Balances can be `ok`, `no_trustline` or `no_account`.
- Register is a 3-step flow (role → name → optional wallet). Login derives the role from the connected wallet: it's matched against the three configured recipient addresses, where household → guardian, student → student and savings → OFW (the OFW sends from the savings wallet), and it keeps any name given at register. The profile (role, name, wallet) lives only in browser localStorage and is **not** authentication: the name and the role picked at register are self-declared, and Freighter reports an address without signing a proof.
- Money uses `lib/amount.ts` bigint/stroops strings, never floats. Paiflow is called only from server-only `lib/paiflow.ts`. Starter modes are `prepare`, `demo` and `team`.
- Not building now: savings locked until a date, peso cash-out, self-serve family setup, and changing the split after deployment.

## Brand Commitments

- Canonical name: **Pundar**. "Padala Split" in `docs/laan-pitch.md` is an earlier working name.
- Voice: warm and plain Taglish for families. Share names are Pang-bahay, Baon sa eskwela and Ipon ng OFW, with English labels (Household, School allowance, OFW savings) so judges can follow.
- Always be honest that this is a testnet prototype: "Walang totoong pera."
- Built by team **TypeShift**: Trisha Nicole Aguilar, Khobe Clayne Lolong, Jharell James Sederia and Gabriel Resultay, all BS Information Technology students at José Rizal University (JRU). Individual roles are not specified, so don't invent them.
- Copy should be natural Taglish: explanations in plain English, with Filipino where people actually say it (share names, "padala", the tagline). Avoid stiff, formal Tagalog.

## Evidence on Hand

- Sourced statistics in `docs/laan-pitch.md`: the BSP record of $35.63B in remittances (2025), PSA's 2.19M OFWs sending ₱262.2B (2024), BSP CES finding that about 95% of remittances go to basic needs, and PSA figures showing OFW savers fell from 53.1% to 34.6%.
- A recorded, successful 60/15/25 testnet split transaction.
- **Not on hand, so never fabricate:** testimonials or family quotes, users or pilot families, partners or agencies, revenue, and peso cash-out. The TAM/SAM/SOM figures and the 0.5% fee are labelled assumptions.

## Product Principles

1. **The plan is the promise.** Show the agreed split as fixed and verifiable, not adjustable.
2. **Each share has a person.** Always tie money to who receives it, not to abstract buckets.
3. **Proof over claims.** Real balances, transaction links and sourced numbers beat persuasion copy.
4. **Legible in seconds.** A judge who doesn't speak Tagalog should still understand the flow at a glance.
5. **Honest about the prototype.** Testnet and its limits are stated, never hidden.
