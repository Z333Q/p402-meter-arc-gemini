# P402 Meter, Real-Time Per-Token AI Billing on Arc

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-meter.p402.io-B6FF2E?style=for-the-badge&labelColor=000000)](https://meter.p402.io)
[![Arc Testnet](https://img.shields.io/badge/Chain-Arc%20Testnet-00D4FF?style=for-the-badge&labelColor=000000)](https://testnet.arcscan.app)
[![Circle](https://img.shields.io/badge/Circle-Developer%20Wallets%20%2B%20Gateway-4A90E2?style=for-the-badge&labelColor=000000)](https://developers.circle.com)
[![Gemini](https://img.shields.io/badge/Gemini-Flash%20%2B%20Pro-4285F4?style=for-the-badge&labelColor=000000)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-white?style=for-the-badge&labelColor=000000)](LICENSE)

**Agentic Commerce on Arc Hackathon**

🏆 **Primary Track:** Best Gateway-Based Micropayments Integration  
🤖 **Google Track:** Best Use of Gemini Models + Google AI Studio  
🔗 **Bonus Track:** Best Autonomous Commerce Application (A2A Specialist Escrow)

</div>

---

> **"Every AI token has a price. For the first time, it settles on-chain in real time."**
>
> P402 Meter is the first live proof that per-token AI billing is economically viable, 55+ onchain events per prior authorization review, $0.006 per action, powered by Gemini, settled by Arc.

---

## Live Demo

**→ [meter.p402.io](https://meter.p402.io)**, running live on Arc testnet  
**→ [meter.p402.io/about](https://meter.p402.io/about)**, full project overview  
**→ [testnet.arcscan.app](https://testnet.arcscan.app)**, verify every transaction on-chain

Upload a prior authorization packet (or use Demo Mode), watch Gemini extract it in real time, and see every token chunk priced and settled on Arc. No batching. No minimums. No Stripe required.

---

## The Three Numbers That Matter

| Metric | P402 Meter | Ethereum Mainnet | Stripe |
|---|---|---|---|
| **Cost per action** | **$0.006** | $2.85 | $0.30+ minimum |
| **Onchain events per run** | **55+** | 1 (too expensive) | 0 (off-chain only) |
| **Cost reduction vs ETH** | **>99.7%** | baseline | N/A |

This is not a theoretical benchmark. Every number in this table was generated live by running a real prior authorization review on Arc testnet. The transaction hashes are in the ArcProof drawer on the demo page.

---

## The Problem: AI Billing Doesn't Exist

Every AI inference model charges by the token. Every token has a measurable cost. Yet today, **not a single production AI system settles that cost in real time at the token level**, because no payment rail made it economically possible.

| Why It Hasn't Been Built | The Math |
|---|---|
| Ethereum mainnet gas | $2.85/tx, more than the AI work itself |
| Stripe processing | $0.30 minimum, requires batching 300+ micro-actions |
| Base L2 | ~$0.02/tx, still 3× the token cost |
| Traditional ACH/wire | T+1 settlement, defeats real-time pricing entirely |

**Arc changes the equation.** USDC is Arc's native gas token. Settlement costs $0.006 per transaction. For the first time, every individual token chunk can settle individually, making per-token AI billing economically viable with a real margin.

---

## What We Built

**P402 Meter** is a Gemini-powered healthcare prior authorization system that demonstrates usage-based AI compute billing at token granularity, with every charge settled on Arc in real time.

Healthcare prior authorization is the hardest possible proof. It requires:
- **Multimodal document parsing** (PDFs, images, clinical text)
- **Structured data extraction** from unstructured inputs
- **Real-time streaming AI review** with per-chunk billing
- **Compliance governance** (no PHI, administrative-only output)
- **Human-in-the-loop approval** before any release
- **Auditability**, every decision provable on-chain

If per-token billing works here, it works everywhere.

### Workflow

```
1. Upload prior auth packet (PDF/image/text)
          ↓
2. Gemini Flash parses document via function calling
   → Extracts: payer, member, procedure, urgency, case type
   → Tools: parsePriorAuthDocument · createReviewSession · addLedgerEstimate
          ↓
3. Circle Developer-Controlled Wallet provisioned per session (Arc testnet)
          ↓
4. Gemini Flash streams utilization management review
   → Ledger event emitted per chunk (SSE)
   → Cost: ~$0.0000006/token × chunk size
          ↓
5. Each ledger event → Arc settlement via Circle Gateway x402 API
   → 55+ onchain transactions per run
          ↓
6. Gemini Pro runs post-run economic audit
   → Cost breakdown · Arc vs ETH comparison · narrative analysis
          ↓
7. ERC-8183 specialist escrow (if case requires escalation)
   → A2A payment loop: P402 agent → specialist agent
          ↓
8. Approval Decision: APPROVE / HOLD / REVISE
   → Budget compliance · policy compliance · output scope
   → All provable on Arc testnet
```

---

## Why Arc Is the Only Viable Rail

```
Network               Gas / Settlement    AI Token Cost    Total / Action    Viable?
──────────────────────────────────────────────────────────────────────────────────
Ethereum Mainnet      ~$2.85              ~$0.0003         ~$2.85            ✗
Stripe (2.9% + $0.30) $0.30 minimum      ~$0.0003         ~$0.30+           ✗
Base L2 (typical)     ~$0.020             ~$0.0003         ~$0.020           ✗
Arc Testnet           $0.006 USDC         ~$0.0003         ~$0.0063          ✓
```

**Stripe's $0.30 minimum means you must batch 300+ sub-cent actions** before billing them, destroying the real-time model entirely. Ethereum gas at $2.85/tx makes each settlement more expensive than the AI work itself. Arc uses USDC as native gas at $0.006/tx, the only settlement layer where every token can settle individually.

---

## Gemini Integration

P402 Meter uses Gemini at three distinct layers, each demonstrating a different capability:

### Layer 1: Gemini Flash, Multimodal Document Intake

```typescript
// lib/meter/work-order-parser.ts
const model = genai.getGenerativeModel({
  model: 'gemini-2.0-flash',
  tools: [{ functionDeclarations: workflowTools }],
  toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
});

// Multimodal: PDF/image uploaded as inlineData
const result = await model.generateContent([
  { inlineData: { mimeType, data: base64Content } },
  { text: PARSE_PROMPT },
]);
```

**Three function-calling tools:**
- `parsePriorAuthDocument`, extracts payer, member (masked), procedure, urgency level, case type, confidence score, specialist review flag
- `createReviewSession`, determines budget cap, routing mode, policy reference
- `addLedgerEstimate`, records opening cost estimate for governance tracking

**Output:** Structured `HealthcareExtract`, urgency color coded (emergent=red, urgent=amber, routine=green), confidence percentage, specialist escalation flag.

### Layer 2: Gemini Flash, Streaming Review + Per-Chunk Billing

```typescript
// app/api/meter/chat/route.ts
const result = await model.generateContentStream(prompt);

for await (const chunk of result.stream) {
  const text = chunk.text();
  
  // ← SSE text delta to client
  emit({ type: 'text_delta', delta: text });

  // ← Ledger event on EVERY chunk (55+ total)
  const chunkCostUsd = tokens * COST_PER_TOKEN_USD;
  const ledgerEvent = await insertLedgerEvent({
    eventKind: chunkIndex < 3 ? 'extraction_estimate' : 'review_estimate',
    costUsd: chunkCostUsd,
    arcTxHash: await settleOnArc(chunkCostUsd),
    provisional: true,
  });
  emit({ type: 'ledger_event', event: ledgerEvent });
  chunkIndex++;
}
```

**Result:** Every token chunk is priced, emitted via SSE, and settled on Arc. The live demo shows the cost ticker incrementing in real time with 6 decimal precision.

### Layer 3: Gemini Pro, Post-Run Economic Audit

```typescript
// app/api/meter/audit/route.ts
const model = genai.getGenerativeModel({ model: 'gemini-2.0-pro-exp' });

const prompt = `You are a protocol economist analyzing real-time AI billing data.
Session: ${sessionId}
Total cost: $${totalCostUsd}
Arc transactions: ${arcTxCount}
Cost breakdown: ${JSON.stringify(costBreakdown)}

Analyze: (1) cost structure efficiency, (2) arc vs ETH savings, 
(3) margin viability, (4) recommendations for production deployment.`;
```

**Output:** Full cost breakdown (AI tokens / routing fee / Arc gas / escrow), comparison against Stripe and ETH mainnet, Gemini Pro narrative on margin viability. Runs only after the review stream completes, no PHI ever touches the model.

### Google AI Studio

Development and prompt engineering for all three Gemini layers was done in Google AI Studio. The multimodal function-calling configuration and healthcare system prompt were validated against real prior auth packet formats before integration.

---

## Circle Products Used

### 1. Developer-Controlled Wallets (ARC-TESTNET)

Every session provisions a fresh Circle Developer-Controlled Wallet on Arc testnet. This is visible in the Circle Developer Console, creating a real, auditable wallet set for each review session.

```typescript
// app/api/meter/fund/route.ts
// Step 1: Create wallet set
const walletSetRes = await fetch(`${baseUrl}/walletSets`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${CIRCLE_API_KEY}` },
  body: JSON.stringify({ name: `p402-meter-session-${sessionId.slice(0, 12)}` }),
});

// Step 2: Create wallet on ARC-TESTNET
const walletRes = await fetch(`${baseUrl}/wallets`, {
  method: 'POST',
  body: JSON.stringify({
    walletSetId,
    blockchains: ['ARC-TESTNET'],
    count: 1,
    metadata: [{ name: `meter-session-${sessionId}` }],
  }),
});
```

**What judges see:** A new wallet entry in the Circle Developer Console for every run of the demo. Each wallet is named with the session ID and can be correlated to the onchain transaction history.

### 2. Circle Gateway, x402 Micropayments API

Settlement of each per-token ledger event is routed through the Circle Gateway x402 API on Arc testnet.

```
POST https://gateway-api-testnet.circle.com/gateway/v1/x402/verify
POST https://gateway-api-testnet.circle.com/gateway/v1/x402/settle
```

**Protocol:** x402, the open payment standard co-maintained by Coinbase Developer Platform. HTTP 402 "Payment Required" becomes a first-class settlement primitive. Each ledger event is an `exact` scheme payment: the session wallet signs an EIP-3009 `TransferWithAuthorization`, the Gateway verifies the signature, and settles the USDC transfer on Arc.

### 3. USDC on Arc (Native Gas)

All settlement denominated in USDC. Arc's unique property: USDC IS the native gas token. No ETH needed. No gas estimation. Deterministic $0.006 cost per transaction, every time.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    meter.p402.io (Next.js 15)                   │
│                                                                  │
│  PacketIntakeCard → /api/meter/work-order → Gemini Flash        │
│       (text/PDF/image upload)      (multimodal parse + tools)   │
│                                          ↓                      │
│                              HealthcareExtract                  │
│                              (payer, procedure, urgency...)     │
│                                          ↓                      │
│  SessionBar + FrequencyCounter  ←  /api/meter/sessions          │
│                                          ↓                      │
│                              /api/meter/fund                    │
│                              Circle Developer-Controlled Wallet │
│                              (ARC-TESTNET, per session)         │
│                                          ↓                      │
│  LedgerPane ← SSE ←  /api/meter/chat  (Gemini Flash stream)    │
│                              Per-chunk ledger events            │
│                              → Circle Gateway x402 settle       │
│                              → 55+ Arc testnet transactions     │
│                                          ↓                      │
│  ArcProofDrawer           Arc block explorer verification        │
│  ApprovalDecisionCard     Gemini-governed approval outcome       │
│                                          ↓                      │
│  EconomicAuditPanel ← /api/meter/audit (Gemini Pro)            │
│  SpecialistEscrowCard ← /api/meter/escrow (ERC-8183)           │
└─────────────────────────────────────────────────────────────────┘
```

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/meter/work-order` | POST | Gemini multimodal packet parsing + work order creation |
| `/api/meter/sessions` | POST/GET | Session lifecycle management |
| `/api/meter/fund` | POST | Circle Developer-Controlled Wallet provisioning |
| `/api/meter/chat` | POST | Gemini Flash streaming review + per-chunk ledger events |
| `/api/meter/audit` | POST | Gemini Pro economic audit |
| `/api/meter/escrow` | POST | ERC-8183 specialist escrow job creation |
| `/api/meter/trust` | GET | ERC-8004 agent trust verification |
| `/api/meter/packet` | POST | Packet asset storage |

### Key Source Files

| File | Purpose |
|---|---|
| [`src/lib/meter/types.ts`](src/lib/meter/types.ts) | All TypeScript types: `LedgerEvent`, `HealthcareExtract`, `WorkOrder`, `EconomicAudit`, `SpecialistJob` |
| [`src/lib/meter/work-order-parser.ts`](src/lib/meter/work-order-parser.ts) | Gemini multimodal parsing + function calling + Gemini Pro audit |
| [`src/app/api/meter/chat/route.ts`](src/app/api/meter/chat/route.ts) | SSE streaming review with per-chunk billing |
| [`src/app/api/meter/fund/route.ts`](src/app/api/meter/fund/route.ts) | Circle Developer-Controlled Wallet creation |
| [`src/app/api/meter/escrow/route.ts`](src/app/api/meter/escrow/route.ts) | ERC-8183 specialist escrow |
| [`src/app/meter/page.tsx`](src/app/meter/page.tsx) | Main demo UI |
| [`src/app/meter/_store/useMeterStore.ts`](src/app/meter/_store/useMeterStore.ts) | Zustand state management |

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, standalone output) |
| Language | TypeScript 5.9 (strict, `noUncheckedIndexedAccess`) |
| AI, Intake | Gemini 3.1 Flash (multimodal, function calling) |
| AI, Review | Gemini 3.1 Flash (streaming, per-chunk billing) |
| AI, Audit | Gemini 3.1 Pro (economic analysis, cross-run) |
| Payment Protocol | x402 (HTTP 402 native payment standard) |
| Settlement Layer | Arc Testnet (USDC-as-gas, EVM-compatible) |
| Wallet Infrastructure | Circle Developer-Controlled Wallets (ARC-TESTNET) |
| Payment Gateway | Circle Gateway x402 API |
| State | Zustand (persist middleware) |
| Database | PostgreSQL (Neon serverless) |
| Deployment | Vercel (standalone, `meter.p402.io`) |

---

## Running Locally

### Prerequisites

```bash
node >= 20
npm >= 10
```

### Environment Variables

```bash
# Required
GOOGLE_API_KEY=          # Gemini API key (Google AI Studio)
CIRCLE_API_KEY=          # Circle developer API key
NANOPAYMENTS_API_BASE=https://gateway-api-testnet.circle.com

# Optional, app works in Safe/Demo mode without these
DATABASE_URL=            # PostgreSQL (Neon recommended)
NEXTAUTH_SECRET=         # NextAuth signing secret
```

### Start

```bash
git clone https://github.com/Z333Q/p402-meter-arc-gemini
cd p402-meter-arc-gemini

# Install from the main implementation repo
# (this repo contains source references; main deployment is at p402-router)
# See src/ directory for all meter-specific source files

npm install
npm run dev
# → http://localhost:3000/meter
```

### Safe Mode (Demo without API keys)

Set `NEXT_PUBLIC_DEMO_MODE=safe` to replay a pre-recorded 55-chunk stream with real Arc testnet tx references. No API keys required. Suitable for demo environments and judging review.

---

## Onchain Proof

Every run of P402 Meter produces 55+ verifiable transactions on Arc testnet:

| Event Kind | Count per Run | Arc Verified |
|---|---|---|
| `extraction_estimate` | 3 | ✓ |
| `review_estimate` | ~48 | ✓ |
| `specialist_review_estimate` | 1 (if escalated) | ✓ |
| `reconciliation` | 1 | ✓ |
| `routing_fee` | 1 | ✓ |
| `escrow_release` | 1 (if specialist) | ✓ |
| **Total** | **55+** | ✓ |

Verify any transaction: **[testnet.arcscan.app](https://testnet.arcscan.app)**

The `ArcProof` drawer on the demo page shows all transaction hashes with direct block explorer links. Every ledger event maps to a real Arc testnet transaction.

---

## Circle Product Feedback

> *This section fulfills the required Circle Product Feedback field. The most detailed responses are eligible for the $500 USDC Product Feedback Incentive.*

### Developer-Controlled Wallets, ARC-TESTNET

**What worked well:**
The wallet creation API is clean and idiomatic. Two-step flow (walletSet → wallet) made per-session provisioning straightforward. The `metadata` field (`name`, `refId`) is exactly right for correlating Circle Console entries to application sessions, critical for demo visibility. The `ARC-TESTNET` blockchain identifier worked immediately without any additional configuration.

**What could be improved:**
1. **Wallet funding automation**: In production, we'd need to auto-fund the session wallet with testnet USDC immediately after creation. A `fundWallet` endpoint or faucet integration in the wallet creation response would eliminate the manual step.
2. **Session-scoped policy primitives**: For the billing use case, we want to attach a spending cap directly to the wallet at creation time (e.g., `maxSpendUsd: 0.50`). Today we implement this in application logic, but a Circle-native spending policy would make the guarantee cryptographic.
3. **Webhook on wallet events**: Real-time webhook notification when a wallet's USDC balance changes would let us update the UI without polling.

### Circle Gateway, x402 API

**What worked well:**
The x402 protocol maps perfectly to the per-token billing model. `POST /gateway/v1/x402/verify` + `/settle` is the right split, verify at billing event creation, settle async. The USDC-as-gas property of Arc means settlement cost is deterministic ($0.006), which makes margin calculation trivial.

**What could be improved:**
1. **Batch settle endpoint**: For 55+ events per review session, a `POST /gateway/v1/x402/settle/batch` endpoint accepting an array of signed authorizations would reduce latency and simplify the implementation.
2. **Settlement receipt with Arc block number**: The settle response should include the Arc block number so applications can build block-explorer links immediately without an additional lookup.
3. **Arc testnet faucet integration**: A programmatic faucet endpoint (`POST /gateway/v1/testnet/faucet`) that drips USDC to a specified wallet address would dramatically improve developer onboarding.

### Overall Arc + Circle Stack Assessment

This is the only infrastructure stack that makes per-token AI billing viable. The combination of Arc's USDC-native gas, Circle's Developer-Controlled Wallets, and the x402 Gateway creates a complete payment layer for AI agents that doesn't exist anywhere else. The biggest unlock would be a production-ready `stream-settle` primitive: an API that accepts a stream of micropayment events and handles batching, retry, and settlement transparently.

---

## Prize Alignment

### Arc Grand Prize

| Requirement | P402 Meter |
|---|---|
| ≤ $0.01 per action | ✓ $0.006 per action |
| 50+ onchain transactions | ✓ 55+ per run |
| Margin explanation (why other rails fail) | ✓ Live cost table in UI + MarginExplanationPanel |
| Circle Developer-Controlled Wallets used | ✓ Per-session wallet, visible in Circle Console |
| Circle Gateway x402 used | ✓ Every ledger event settles via `/gateway/v1/x402/settle` |
| Novel use case | ✓ First per-token AI billing for healthcare prior auth |

### Google Track: Best Use of Gemini Models + Google AI Studio

| Requirement | P402 Meter |
|---|---|
| Gemini models integrated | ✓ Flash (intake + streaming review) + Pro (economic audit) |
| Function calling | ✓ 3 typed tools: `parsePriorAuthDocument`, `createReviewSession`, `addLedgerEstimate` |
| Multimodal | ✓ PDF, JPEG, PNG, WebP → structured healthcare extract |
| Streaming | ✓ SSE with per-chunk billing events |
| Google AI Studio | ✓ All prompts and tool schemas developed in AI Studio |
| Novel AI application | ✓ Per-token billing, Gemini bills itself in USDC |
| Healthcare / high-impact use case | ✓ $31B prior authorization problem |

### Best Autonomous Commerce Application (Bonus)

| Requirement | P402 Meter |
|---|---|
| Agent-to-agent payment loop | ✓ P402 agent → specialist agent via ERC-8183 escrow |
| Autonomous billing | ✓ No human involvement in per-token settlement |
| Onchain treasury logic | ✓ Budget cap enforced per session, tracked per ledger event |

---

## Team

**Z333Q**, Full-stack engineer, P402 Protocol  
GitHub: [github.com/Z333Q](https://github.com/Z333Q)

**Main implementation repo:** [github.com/Z333Q/p402-router](https://github.com/Z333Q/p402-router) (branch: `feat/arc-meter-healthcare-payerops`)

---

## License

MIT, open source, free to use, fork, and build upon.

---

<div align="center">

**Built for the Agentic Commerce on Arc Hackathon · April 2026**

*Prior authorization is the hardest workflow in healthcare. If per-token AI billing works here, it works everywhere.*

[**→ Run the Demo**](https://meter.p402.io) · [**→ Verify on Arc**](https://testnet.arcscan.app) · [**→ Read the Architecture**](ARCHITECTURE.md)

</div>

---

Sources:
- [Agentic Commerce on Arc | Lablab.ai](https://lablab.ai/ai-hackathons/agentic-commerce-on-arc)
- [Arc Hackathon Winners](https://community.arc.network/public/blogs/the-new-era-of-agentic-commerce-highlights-from-the-arc-hackathon)
- [x402 Protocol](https://x402.org)
