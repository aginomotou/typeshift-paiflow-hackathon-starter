# New Idea Scan — Groups, Problem and Pitch

Oct 14, 2026 · @agi

## Group scan

**Pick: OFW families.** They have the biggest, best-documented money flow ($35.63B in 2025), a clear trust gap between the worker abroad and the household, and a fixed-split fit that suits Paiflow with Dev mode off. Online sellers and jeepney cooperatives are strong runners-up.

| Group | The problem (who · how often · today · why now) | Evidence | Pain | Timely | Paiflow fit | Buildable today | Total /25 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **OFW families** | Monthly remittance lands with one relative, who decides how it's spent; the worker can't see whether tuition or savings got funded; record remittances in 2025 | 5 | 4 | 4 | 5 | 4 | **22** |
| **Small online sellers** | Every sale, the seller manually forwards a supplier's or reseller's share; consignment and drop-ship partners wait and chase | 3 | 4 | 3 | 5 | 5 | **20** |
| Jeepney cooperatives (PUV consolidation) | Daily fares go to the coop; drivers on quotas can't see their share; some coops report no income for years | 4 | 5 | 3 | 4 | 3 | **19** |
| Freelance teams and small agencies | Client pays one member, who splits it with collaborators by hand | 2 | 3 | 3 | 5 | 5 | **18** |
| Homeowners' and barangay associations | Monthly dues held by one officer; members can't trace spending | 2 | 3 | 2 | 5 | 5 | **17** |
| Farmers' cooperatives | Buyer pays the coop; members wait for their share of each delivery | 3 | 5 | 3 | 2 | 2 | **15** |

**Why not the others:** farmers' shares change with every delivery, which needs per-payment recipients (blocked while Dev mode is off). Homeowners' associations repeat KABAN. The jeepney evidence is strong ([Inquirer, Nov 2023](https://newsinfo.inquirer.net/1864049/jeepney-drivers-operators-say-consolidating-caused-financial-losses): one coop "has not reported any income" in three years), but fixing it needs coop buy-in you can't demo today.

## Problem statement

**OFWs send money home every month, but it lands with one relative who decides how it's spent, so the worker abroad can't be sure tuition is paid or that anything is being saved for their own return.**

Working name: **Padala Split**. Each remittance splits itself on arrival into fixed shares: household, the child's school allowance, and the OFW's own savings.

## Evidence

The flow is huge and growing, almost all of it goes to daily needs, and only about a third of OFWs save. Each figure was checked on its source page today.

| Stat (as the source words it) | Source | Year | What it proves |
| --- | --- | --- | --- |
| Cash remittances hit a record **$35.63 billion**, up 3.3% from $34.49 billion | [Philstar, citing BSP](https://www.philstar.com/business/2026/02/17/2508451/remittances-reach-record-high-356-billion/amp/) | 2025 | Scale, and it's growing |
| **2.19 million** OFWs; they sent **₱262.20 billion**; average **₱129,000** per OFW | [GMA News, citing PSA](https://www.gmanetwork.com/news/pinoyabroad/dispatch/969755/ofws-grew-to-2-19m-in-2024-psa/story/) | 2024 | Number of people and pesos per family |
| 94.8% (Metro Manila) and 95.7% (outside) of OFW households say remittances go primarily to food and household items; 44% and 36.6% set some aside for savings | [Inquirer, citing BSP Consumer Expectations Survey Q3](https://newsinfo.inquirer.net/?p=2153866) | Dec 2025 | Most money is spent on day-to-day needs |
| OFW savers fell from **53.1% (2009)** to a low of **32.7%** before COVID-19, and stood at **34.6% in 2022**; at least half of savers save less than a quarter of their remittances | [Philstar (Opiniano), citing PSA Survey on Overseas Filipinos](https://www.philstar.com/business/2023/11/18/2312428/ofw-savers-declining-last-14-years/amp/) | 2023 article | Saving has declined, which is the pain the split targets |

**Human example:** not yet sourced. Before pitching, get one real Taglish quote from a classmate whose parent works abroad ("Sabi ni Mama, wala pa rin daw siyang ipon…") and put it on the hook slide with their permission.

## TAM / SAM / SOM

The market is 2.19 million OFWs sending ₱262B a year; a first foothold of about 4,100 families moves roughly ₱530M a year. Inputs marked *assumption* are ours.

| Layer | Math | People | ₱ per year |
| --- | --- | --- | --- |
| **TAM**: all OFWs | 2.19M OFWs, total sent ₱262.20B (PSA 2024) | 2.19M | ₱262.2B |
| **SAM**: OFWs who already send through apps or money-transfer services | 2.19M × 37.5% (money-transfer services' share of cash remittances, PSA 2024, used as a proxy) × ₱129,000 | \~821k | \~₱106B |
| **SOM**: first 2 years | 0.5% of SAM *assumption* = \~4,100 families × ₱129,000 | \~4,100 | \~₱530M moved; \~₱2.6M revenue at a 0.5% fee *assumption* |

**Bottom-up check:** reach OFWs through 40 recruitment agencies or OFW Facebook communities × 100 workers each = 4,000 families, matching the top-down figure.

**Caveat to state:** the 37.5% is a share of remittance *value*, not of people, so the SAM is a rough proxy.

## Existing solutions

**Decision: keep the idea, but change the wedge.** [INGAT](https://github.com/fjdvm/INGAT), an open-source Stellar/Soroban project, already splits an OFW's remittance "into a Spending bucket and a Goal bucket using custom ratios", with the goal locked until a date. Judges in the Stellar world may know it, so "we split remittances on-chain" is not new. What INGAT doesn't do is send each share to a **different person**. That becomes Padala Split's edge.

| Alternative | What it does | Gap for an OFW family |
| --- | --- | --- |
| Status quo: send to one relative (bank, GCash or money-transfer service) | Fast, familiar; banks handled 61.1% of cash remittances in 2024 (PSA) | One person holds everything; the OFW learns how it was spent only by asking |
| [INGAT](https://github.com/fjdvm/INGAT) (Stellar) | Splits one recipient's remittance into spending and a time-locked goal | Both buckets belong to the same recipient; no separate share for a child or for the OFW's own savings |
| Bank OFW savings accounts | A place to park savings | Saving is still a manual choice each month, made by whoever receives the money |

| Criterion | Send to one relative | INGAT | **Padala Split** |
| --- | --- | --- | --- |
| Shares go straight to different people | ✗ | ✗ | ✓ household / student / OFW savings |
| Savings happen automatically | ✗ | ✓ (locked goal) | ✓ (sent to the OFW's own wallet) |
| Savings locked until a date | ✗ | ✓ | ✗ (future: Paiflow time condition) |
| The OFW can verify every split | ✗ | ✓ on-chain | ✓ on-chain + family activity link |
| Built and demo-able on Paiflow today | n/a | n/a | ✓ On Receive → Split |

**Unique value statement:** *Unlike sending to one relative, or splitting into buckets that one person still controls, Padala Split sends each part of a remittance straight to the person it's for, so OFWs know the tuition is covered and their own savings grow every month.*

**Where others win:** INGAT can lock savings until a date, which we can't do safely today; the status quo is instant and familiar. We compete on directing money to the right people, not on locking it.

## Solution

One Paiflow deployment per family: **On Receive (USDC) → Split** into three fixed wallets, agreed by the OFW and family before deploying.

- **60% Household** (the guardian's wallet)
- **15% School allowance** (the student's own wallet)
- **25% OFW savings** (a wallet only the OFW controls)

USDC fits the story because remittances are earned in dollars; every recipient needs the USDC trustline. With Dev mode off, the split can't change per remittance, which is exactly the promise: the plan the family agreed on is the plan the money follows.

**Today**

1. Payday abroad; the OFW sends the whole amount to Mama.
2. Mama covers groceries, then bills, then whatever's left.
3. Tuition is paid late; savings are "next month".
4. Years later, the OFW comes home with little saved.

**With Padala Split**

1. **Setup, once:** the family video-calls and agrees 60/15/25; the flow is deployed.
2. **Payday:** the OFW sends the remittance to the family's payment link.
3. **Seconds later:** 60% reaches Mama, 15% the student, 25% the OFW's savings wallet.
4. **Every month after:** the OFW opens the family's activity link and sees it happen; nobody has to ask.

**Demo moment:** a teammate plays the OFW and sends 100 USDC (test funds); three balances move to 60 / 15 / 25 at once, with the transaction link on screen. That transaction is your qualifying payout.

**Not building now:** locked savings until a date (a Paiflow time condition, riskier), peso cash-out, self-serve family setup, changing the split later (needs a new deployment).

## Pitch

### Script (5:00, about 620 words)

**0:00–0:30 · Hook.** \[Open with your classmate's real quote.\] "\[Classmate's name\]'s \[parent\] has worked abroad for \[X\] years. Every month, the whole salary goes to one person at home. And every year, the same question: *nasaan na ang ipon?*"

**0:30–1:15 · The problem is real.** "Filipinos abroad sent home a record 35.6 billion dollars last year, per the BSP. But in the BSP's own survey, about 95% of OFW households say remittances go primarily to food and household needs. And the PSA found the share of OFWs who save fell from 53% in 2009 to under 35% by 2022. The money arrives. The plan doesn't."

**1:15–1:30 · Why now.** "Remittances are at a record, and families already send digitally. The missing piece is a remittance that knows where each peso should go."

**1:30–2:00 · Market.** "2.19 million OFWs sent 262 billion pesos home in 2024. About 821,000 already send through apps and money-transfer services. Our first foothold: around 4,000 families reached through agencies and OFW communities, about half a billion pesos a year flowing exactly where families agreed."

**2:00–4:00 · Solution and live demo.** "This is Padala Split. Before deploying, the family agrees on a plan: 60% for the household, 15% for the student's allowance, 25% for the OFW's own savings. That plan is deployed on Paiflow, and it can't be changed per remittance.

&#91;DEMO\] I'm the OFW. Payday. I send 100 USDC to my family's link. \[Send.\] One remittance. \[Point.\] Sixty to Mama. Fifteen to my daughter. Twenty-five to my savings, a wallet only I control. Three balances, one moment. Here's the transaction, and my family can see it too.

No more 'nasaan na'. Saving isn't a decision someone has to remember every month. It just happens. Today it's testnet funds; cash-out to pesos is our next step."

**4:00–4:30 · Why us.** "Today the money goes to one person. Projects like INGAT on Stellar split a remittance into buckets, but one person still holds them all. Padala Split sends each part straight to the person it's for. INGAT can lock savings until a date, and we can't yet. We win on getting the money to the right people."

**4:30–5:00 · Close.** "OFWs work years abroad for their families. Padala Split makes sure part of that work comes home to them too. Para sa pamilya, at para sa'yo. Salamat po."

### Slide outline

| # | Slide | The one message | On screen |
| --- | --- | --- | --- |
| 1 | Padala Split | Every peso goes where the family agreed | Name, tagline, team |
| 2 | Hook | The money arrives; the plan doesn't | Classmate's quote |
| 3 | Proof | Record flow, little saved | $35.63B (BSP 2025), \~95% to basic needs (BSP CES), savers 53% → 34.6% (PSA) |
| 4 | Market | Big and reachable | 2.19M → \~821k → \~4,100 families, ₱ figures labelled |
| 5 | Solution | Agree once; every remittance follows | 60 / 15 / 25 split diagram |
| 6 | Live demo | Three balances move at once | App + transaction link |
| 7 | Why us | Each share goes straight to the right person | Comparison: one relative, INGAT, Padala Split |
| 8 | Next | Peso cash-out, locked savings | Roadmap |

### Judge Q&A

| Likely question | Short answer |
| --- | --- |
| Where's that number from? | BSP 2025 full-year data (via Philstar); PSA Survey on Overseas Filipinos 2024 (via GMA); BSP Consumer Expectations Survey Q3 (via Inquirer). |
| Isn't this just INGAT? | "INGAT splits a remittance into buckets for one recipient. We send each share to a different person, including the OFW's own savings. They lock savings; we direct them." |
| Why not just GCash? | "GCash sends to one number. We're what happens after the money arrives." |
| How do you make money? | "A small fee, about 0.5% per remittance, on top of what families already pay to send." |
| What if the family wants to change the split? | "Today that's a new, visible deployment. That's deliberate: the plan can't be quietly changed." |
| Doesn't each family need its own deployment? | "Yes. One deployment serves one family. Self-serve setup for thousands of families is our next feature." |
| Biggest risk? | "Cash-out to pesos needs a licensed partner. Today we're on testnet, and we say so." |
| What about emergencies? | "The household share covers daily needs; the OFW can always send extra outside the plan." |

### Demo fallback

- Record a successful split this morning; keep screenshots of the three balances and the transaction link.
- Check all three wallets have the USDC trustline and the sender has testnet USDC.
- If nothing confirms within about 15 seconds, play the recording.

## Gaps and assumptions

- **Assumptions:** 0.5% of SAM in two years, a 0.5% fee, the 60/15/25 split, and 37.5% of remittance value standing in for the share of senders who use transfer services.
- **Not verified:** whether INGAT is still maintained, and whether other OFW-split apps exist on app stores. Spend 5 minutes on the Play Store ("OFW budget", "remittance split") before pitching.
- **Unsourced so far:** a human example. Get one real quote with permission.
- **Data age:** the PSA saver figures run to 2022; the CES article doesn't state the year in its text (published Dec 2025).

## Sources

- [Philstar: Remittances reach record high $35.6 billion (BSP)](https://www.philstar.com/business/2026/02/17/2508451/remittances-reach-record-high-356-billion/amp/)
- [GMA News: OFWs grew to 2.19M in 2024 (PSA)](https://www.gmanetwork.com/news/pinoyabroad/dispatch/969755/ofws-grew-to-2-19m-in-2024-psa/story/)
- [Inquirer: BSP data: OFW remittances go to food, basic needs](https://newsinfo.inquirer.net/?p=2153866)
- [Philstar: OFW savers declining in last 14 years (PSA)](https://www.philstar.com/business/2023/11/18/2312428/ofw-savers-declining-last-14-years/amp/)
- [INGAT on GitHub](https://github.com/fjdvm/INGAT)
- [Inquirer: Jeepney drivers, operators say consolidation caused financial losses](https://newsinfo.inquirer.net/1864049/jeepney-drivers-operators-say-consolidating-caused-financial-losses)
