# P402 Meter — Project Description

## Short Description (100 words)

P402 Meter is the first live demonstration of per-token AI billing settled on-chain in real time.
Healthcare prior authorization review is the proof of concept: a document-heavy, high-stakes workflow
where every AI reasoning step has a measurable cost. Gemini 3.1 Flash reads the prior auth packet,
streams the utilization management review, and emits a USDC ledger event for every output chunk.
57 onchain events per session. Total cost: under $0.01. Gemini 3.1 Pro audits the economics after.
Arc is the only payment rail where this is economically viable.

---

## Long Description

### The Problem

Every AI inference model charges by the token. Every token has a measurable cost. Yet today, not a
single production system bills for AI work at token granularity in real time. The reason is math:

- **Ethereum mainnet gas:** $2.85 per ERC-20 transfer. Costs more than the AI work itself.
- **Stripe minimum:** $0.30 per transaction. Requires batching 300+ micro-actions before charging anything.
- **Base L2:** ~$0.02 per transaction. Still 3x the cost of a typical AI token chunk.

No existing payment rail makes per-token AI billing economically rational. Until Arc.

### The Solution

Arc's native USDC gas token brings settlement cost to $0.006 per transaction. For the first time,
every individual AI token chunk can settle as a discrete on-chain payment event without batching,
without delay, and without destroying the margin.

P402 Meter proves this is real by building the hardest possible use case: healthcare prior
authorization review.

### Why Healthcare

Prior authorization review is the proof-of-concept stress test:

- Multimodal document parsing (PDFs, images, clinical text) — requires vision AI, not just text
- Structured data extraction with typed function calls — requires schema-validated outputs
- Real-time streaming review with per-chunk billing — requires sub-cent settlement economics
- Compliance governance (no PHI, URAC-aligned output) — requires audit-ready artifacts
- Human-in-the-loop approval before release — requires governed session model

If per-token billing works here, it works for any AI workflow.

### What We Built

**Architecture:**
- `POST /api/meter/packet` — ingest document, SHA-256 hash, persist
- `POST /api/meter/work-order` — Gemini 3.1 Flash multimodal extraction with FunctionCallingMode.ANY
- `POST /api/meter/sessions` — open metered session with budget cap enforcement
- `POST /api/meter/fund` — provision Circle Developer-Controlled Wallet on ARC-TESTNET
- `POST /api/meter/chat` — SSE stream, per-chunk ledger events, reconciliation, approval gate
- `POST /api/meter/escrow` — ERC-8183 specialist job creation and deliverable hash
- `GET /api/meter/trust` — ERC-8004 agent identity and reputation
- `POST /api/meter/audit` — Gemini 3.1 Pro economic audit with executive narrative

**Billing flow per chunk:**
1. Gemini emits token chunk
2. Ledger event written (estimate, provisional=true, costUsdcE6 calculated)
3. Text delta emitted to client via SSE
4. After stream: reconciliation event with verified token count
5. Arc settler submits USDC transfer via ethers.js
6. arcTxHash and arcBlock returned, proofRef updated
7. ArcScan link made available in ArcProof drawer

**Result:** 57 onchain events. $0.006347 total. Approval recommendation with three policy dimensions.

### Tech Stack

| Technology | Role |
|---|---|
| **Gemini 3.1 Flash** | Multimodal document parsing, FunctionCallingMode.ANY, streaming review, approval gate |
| **Gemini 3.1 Pro** | Post-run economic audit, executive narrative, cost benchmark analysis |
| **Circle Developer-Controlled Wallets** | Per-session spending account provisioned on ARC-TESTNET |
| **Circle x402 Gateway** | Payment authorization and settlement verification |
| **Arc Testnet** | USDC-native settlement at $0.006/tx (Chain ID 5042002) |
| **ERC-8183** | Specialist review escrow with deliverable fingerprint |
| **ERC-8004** | Agent identity and reputation registry |
| **Next.js 15** | App Router, SSE streaming, server actions |
| **PostgreSQL / Neon** | Persistent audit log for all ledger events |

### Business Case

The buyer is a health plan, TPA, or utilization management vendor currently paying $25-100 per
manual prior authorization review with no real-time cost visibility and no usage-based billing.

**P402 Meter enables:**
- Usage-based vendor billing (pay per case, not per seat)
- Per-action cost visibility and budget cap enforcement
- Audit-ready onchain artifacts for URAC/NCQA compliance programs
- Specialist delegation with financially verified handoff (ERC-8183 escrow)

**ROI:** Sub-cent AI metered actions versus $25-100 manual labor cost per case.

### Compliance Boundary

- All sample packets are synthetic — no real patient data in the system
- All AI output is administrative-only — no clinical decisions are made
- Human approval is required before any release action
- PHI handling would require HIPAA BAA for production deployment with real patient data

---

## Tags

`arc` `circle` `gemini` `usdc` `nanopayments` `usage-based-billing` `prior-authorization`
`healthcare` `finops` `agent-to-agent` `erc8183` `erc8004` `real-time-billing` `defi`
