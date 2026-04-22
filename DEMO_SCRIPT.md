# P402 Meter — On-Site Demo Script
## April 26, 2026 · San Francisco

**Allotted time:** ~5 minutes  
**URL:** meter.p402.io  
**Backup:** Safe Mode (NEXT_PUBLIC_DEMO_MODE=safe)

---

## Setup (Before You Walk Onstage)

1. Open [meter.p402.io](https://meter.p402.io) in Chrome, full screen
2. Confirm Safe Mode banner is OFF (live mode)
3. Have [testnet.arcscan.app](https://testnet.arcscan.app) open in a second tab
4. Have the Circle Developer Console open in a third tab (wallet sets visible)
5. Pre-load a sample prior auth packet (PDF or text) — use the Molina demo packet
6. If live mode has any API issues, toggle `?demo=safe` in the URL immediately

---

## Beat 1 — The Hook (30 seconds)

> "Every AI model in the world charges by the token. Every single token has a price.
> But today, not one production system settles that cost in real time.
> We built P402 Meter to prove it's possible — and we're running it live right now."

**Action:** Point to the hero headline on screen.
*"AI Thinking Has a Price. Watch It Settle on Arc."*

> "Healthcare prior authorization is the hardest workflow we could pick. $31 billion dollars 
> in administrative cost per year. Every decision requires AI, human review, and an audit trail.
> If per-token billing works here, it works anywhere."

---

## Beat 2 — The Problem (45 seconds)

> "Why hasn't anyone built this before? The math."

**Action:** Scroll to the MarginExplanationPanel / cost comparison table.

> "Ethereum mainnet: $2.85 per transaction. That's more than the AI work itself.
> Stripe: $0.30 minimum. To bill at sub-cent granularity, you'd need to batch 
> 300+ actions before you could charge anything — destroying the real-time model.
> Base L2: $0.02 — still 3× the cost of the token.
> Arc: $0.006 USDC. The only rail where every token can settle individually."

**Point at the table.** Let it land.

---

## Beat 3 — The Demo (2 minutes)

**Action:** Upload the sample prior auth packet (drag to the PacketIntakeCard).

> "I'm uploading a de-identified prior authorization packet. 
> Gemini Flash is going to parse this — text, images, PDFs — it handles all of it.
> Watch the extraction happen in real time."

**Wait for WorkOrderCard to populate.**

> "Look at what Gemini extracted: payer name, procedure, urgency level, case type.
> All structured. No PHI. This took 3 function calls — parsePriorAuthDocument, 
> createReviewSession, addLedgerEstimate — and a Circle wallet just got provisioned 
> on Arc testnet for this session."

**Action:** Click "Start Review."

> "Now Gemini is streaming the utilization management review.
> Watch the cost ticker — [point to FrequencyCounter] — that's incrementing 
> with every token chunk. Not batched. Not estimated. Real-time, per-token."

**Wait as the ledger events fire.**

> "Every single one of those rows in the ledger [point to LedgerPane] 
> is a transaction on Arc testnet. Each one has a hash. 
> Each one is verifiable right now."

**Action:** Open the ArcProof drawer. Click a tx hash.

> "Here's the block explorer. This transaction settled 30 seconds ago.
> $0.006. That's Arc."

---

## Beat 4 — The Proof Numbers (45 seconds)

**Action:** Point to FrequencyCounter.

> "By the time this run completes: 55+ onchain events.
> Average cost per action: under a cent.
> Compare that to Stripe minimum — [point to struck-through red numbers] — $0.30.
> Or ETH mainnet — $2.85. Those numbers aren't hypothetical. 
> That's what this session would have cost on other rails."

**Action:** Let EconomicAuditPanel load.

> "And now Gemini Pro — not Flash, Pro — is running an economic audit 
> of its own billing session. It's analyzing the cost structure, 
> calculating the Arc savings, and giving us a viability recommendation.
> An AI model is auditing its own costs. On-chain. In real time."

---

## Beat 5 — The A2A Loop (30 seconds, if time allows)

*Skip this beat if running short on time.*

**Action:** If `requiresSpecialistReview: true` triggered, point to SpecialistEscrowCard.

> "This case got flagged for specialist review.
> That triggered an ERC-8183 escrow — a smart contract job on Arc — 
> where P402 paid a specialist agent to review it.
> That's agent-to-agent commerce. Fully autonomous. Fully on-chain."

---

## Beat 6 — The Close (30 seconds)

> "Three things that are true right now that weren't true before this hackathon:
>
> One: Per-token AI billing is economically viable — proven, live, on Arc.
>
> Two: Gemini can bill itself. Every token it generates has a price, 
> and that price settled on-chain before you finished reading this sentence.
>
> Three: The prior authorization problem — $31 billion in healthcare admin waste —
> has a credible, provable, production-ready technical path.
>
> P402 Meter. meter.p402.io. Every transaction verifiable on Arc testnet right now."

---

## Fallback: Safe Mode

If live mode fails for any reason:

1. Add `?demo=safe` to the URL or set `NEXT_PUBLIC_DEMO_MODE=safe`
2. Explain: *"I'm switching to replay mode — same architecture, pre-recorded stream 
   with real Arc testnet transaction references from our last live run."*
3. The demo proceeds identically — 55 chunks, all events, real tx hashes

---

## Q&A Prep

**"Is this production-ready?"**
> The billing architecture is production-ready. The healthcare layer is a proof-of-concept — 
> HIPAA compliance would require BAA agreements and additional PHI controls. 
> The payment mechanics, however, are live and production-grade.

**"How does this compare to Stripe's AI billing products?"**
> Stripe charges a $0.30 minimum per transaction. That means you need to batch 
> 300+ sub-cent actions before you can bill them. Our model bills every 
> individual token chunk — no batching, no minimums, real-time settlement. 
> That's structurally impossible on Stripe.

**"Why healthcare specifically?"**
> It's the highest-stakes, most regulated, most document-heavy AI governance use case. 
> If we can prove auditability, compliance, and per-token billing here, 
> every other use case is simpler.

**"What's the Circle wallet for?"**
> Each review session gets its own Circle Developer-Controlled Wallet on Arc testnet. 
> This is visible in the Circle Developer Console — it's a real, auditable wallet 
> provisioned per session. In production, this would be the agent's spending account 
> with programmatic budget controls.

**"Can I run this myself?"**
> Yes. meter.p402.io is live right now. Or clone github.com/Z333Q/p402-meter-arc-gemini, 
> add a GOOGLE_API_KEY and CIRCLE_API_KEY, and run `npm run dev`.
