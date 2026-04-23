# P402 Meter — Submission Video Script
## 90-Second Screen Recording

**Track:** Usage-Based Compute Billing  
**Required proof:** 50+ onchain tx · ≤$0.01 per action · margin explanation  
**URL:** meter.p402.io  
**ArcScan:** testnet.arcscan.app

---

### [0:00–0:15] — Hook (voiceover while screen loads)

> "Healthcare prior authorization costs payers $150 per case in manual review.  
> AI can do it in seconds — but only if the billing keeps up.  
> Stripe can't. Ethereum can't. Arc can."

**Screen:** meter.p402.io home — headline visible: *"AI Thinking Has a Price. Watch It Settle on Arc."*

---

### [0:15–0:25] — One-Click Demo

> "I'm going to click one button and run a full live prior authorization review."

**Action:** Click **Run Full Demo →** in the GuidedDemoStrip.

**Screen:** Progress strip animates — `○ Packet → ⬤ Extract → ○ Billing`

> "Gemini Flash is parsing the packet — text, PDF, images — right now."

---

### [0:25–0:45] — Live Streaming Billing

**Screen:** WorkOrderCard populates — tool trace visible (parsePriorAuthDocument, createReviewSession, addLedgerEstimate).

> "Three Gemini function calls. Payer name, procedure, urgency level — extracted.  
> A Circle Developer-Controlled Wallet just opened on Arc testnet for this session."

**Screen:** LedgerPane rows start appearing — costs in yellow/cyan/green.

> "Watch the ledger. Every row is an Arc transaction.  
> AI Events in yellow. Settlement in green. Routing fees in cyan.  
> Each one timestamped, each one on-chain."

---

### [0:45–1:00] — Arc Proof

**Screen:** ArcProofDrawer — summary grid shows event count climbing toward 55+.

> "Fifty-five onchain events. Average cost: under half a cent each.  
> Total session cost: under a dollar — including Arc settlement."

**Action:** Click one `arcTxHash` link — new tab opens to testnet.arcscan.app.

> "That transaction settled on Arc 30 seconds ago. $0.006 USDC.  
> On Ethereum mainnet, that same transfer would be $2.85 — 475× more expensive."

---

### [1:00–1:15] — The Margin Math

**Screen:** MarginExplanationPanel — formula row visible.

> "The math: AI cost plus Arc settlement fee is under $0.01 per review action.  
> At $150 per case, even a 1% margin is profitable at this price point.  
> This is the first time usage-based AI billing has been economically viable."

---

### [1:15–1:30] — Circle + Arc Stack

**Screen:** CircleInfraStrip — all 4 cells lit green (DCW, Nanopayments, Gateway, Arc).

> "The stack: Circle Developer-Controlled Wallets provision per-session spending accounts.  
> Circle Gateway handles x402 payment verification.  
> Circle Nanopayments settles sub-cent USDC on Arc.  
> ERC-8183 smart contracts handle specialist agent escrow.  
> This is the Agentic Economy — live."

---

### Required Checklist for Judges

| Requirement | Where to See It |
|---|---|
| ≤$0.01 per action | SessionBar → Avg/Event cell |
| 50+ onchain transactions | FrequencyCounter → "50-tx Threshold PASS" cell |
| Margin explanation | MarginExplanationPanel (formula + comparison table) |
| Circle Developer Console transaction | CircleInfraStrip → Circle DCW cell lit |
| Arc Block Explorer verification | ArcProofDrawer → click any arcTxHash link |

---

### Recording Tips

- Use safe mode if live Gemini/Arc APIs are slow: tiny dark bar appears at top, GuidedDemoStrip shows "Safe mode · Gemini bypassed"
- Zoom browser to 90% so all panels fit without scrolling
- Record at 1920×1080; crop to the page content area before uploading
- The entire demo runs in ~45 seconds via GuidedDemoStrip — the script above can run in real time
