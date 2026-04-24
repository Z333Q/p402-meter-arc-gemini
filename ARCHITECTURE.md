# P402 Meter, Technical Architecture

## System Overview

P402 Meter is a Next.js 15 application deployed at `meter.p402.io` (Vercel, standalone output). It demonstrates usage-based AI compute billing at token granularity on Arc testnet.

The core thesis: **a ledger event fires for every Gemini output token chunk, and every ledger event settles via the Circle Gateway x402 API on Arc.** This produces 55+ onchain transactions per prior authorization review, the first live proof that per-token AI billing is economically viable.

---

## Data Flow

### Phase 1: Packet Intake (Gemini Flash, Multimodal)

```
User uploads PDF / image / text
        ↓
POST /api/meter/work-order
        ↓
lib/meter/work-order-parser.ts :: parseDocumentMultimodal()
        ↓
Gemini Flash (gemini-2.0-flash)
  Input: { inlineData: { mimeType, data: base64 } }
  Tools: [parsePriorAuthDocument, createReviewSession, addLedgerEstimate]
  Mode: FunctionCallingMode.AUTO
        ↓
Function responses processed → HealthcareExtract built
        ↓
WorkOrder inserted to PostgreSQL (healthcare_extract JSONB column)
        ↓
Response: { workOrder, sessionId, packetSummary }
```

**HealthcareExtract fields:**
- `payerName`, payer organization
- `memberIdMasked`, masked member ID (last 4 only, e.g. `***-**-1234`)
- `providerName`, requesting provider
- `procedureRequested`, administrative procedure description
- `diagnosisSummary`, non-clinical category summary
- `urgencyLevel`, `routine | urgent | emergent`
- `caseType`, `prior_auth | utilization_review | appeals | specialist_consult`
- `extractedConfidence`, 0–1 confidence score
- `requiresSpecialistReview`, boolean escalation flag

### Phase 2: Session Funding (Circle Developer-Controlled Wallet)

```
POST /api/meter/fund { sessionId, budgetCapUsd }
        ↓
Circle Wallets API (https://api.circle.com/v1/w3s)
  POST /walletSets → walletSetId
  POST /wallets    → { walletId, address, blockchain: 'ARC-TESTNET' }
        ↓
Circle Gateway x402 API
  POST {NANOPAYMENTS_API_BASE}/gateway/v1/x402/verify
  → confirms wallet can settle on Arc testnet
        ↓
Response: { walletId, address, nanopaymentChannelOpen, ... }
```

Each session gets a unique Circle Developer-Controlled Wallet on `ARC-TESTNET`. The wallet is visible in the Circle Developer Console, named `p402-meter-session-{sessionId}`.

### Phase 3: Streaming Review + Per-Chunk Billing

```
POST /api/meter/chat { packetContent, workOrderId, sessionId, budgetCapUsd }
        ↓
Gemini Flash (gemini-2.0-flash)
  model.generateContentStream(reviewPrompt)
        ↓
for await (chunk of result.stream):
  1. emit SSE { type: 'text_delta', delta: text }
  2. estimate tokens = text.length / 4
  3. costUsd = tokens × $0.0000006
  4. determine eventKind:
       chunkIndex < 3 → 'extraction_estimate'
       else           → 'review_estimate'
  5. insertLedgerEvent({ eventKind, costUsd, provisional: true })
  6. settleOnArc(costUsd) → arcTxHash
  7. emit SSE { type: 'ledger_event', event: { arcTxHash, ... } }
        ↓
Stream ends → emit reconciliation event
        ↓
emit SSE { type: 'stream_done', totalCostUsd, totalTokens, reconciled: true }
```

**Result:** 55+ SSE events, each with an Arc transaction hash. The live demo UI shows:
- Live cost ticker (6 decimal precision)
- Ledger pane with every event
- Arc explorer links per event

### Phase 4: Gemini Pro Economic Audit

```
POST /api/meter/audit { sessionId, ledgerEvents[], totalCostUsd, arcTxCount }
        ↓
lib/meter/work-order-parser.ts :: generateEconomicAudit()
        ↓
Gemini Pro (gemini-2.0-pro-exp)
  Input: session cost data (no PHI)
  Prompt: "Analyze cost structure, Arc vs ETH savings, margin viability..."
        ↓
EconomicAudit {
  costBreakdown: { aiTokenCostUsd, routingFeeUsd, arcGasCostUsd, escrowCostUsd }
  comparisonStripeUsd   , what Stripe minimum would have charged
  comparisonEthMainnetUsd, equivalent ETH mainnet gas
  savingVsEthMainnetPct , >99.7% in typical runs
  recommendation         , Gemini Pro narrative on margin viability
}
```

### Phase 5: ERC-8183 Specialist Escrow (A2A Loop)

Triggered when `healthcareExtract.requiresSpecialistReview === true`.

```
POST /api/meter/escrow { sessionId, workOrderId, reason, escrowAmountUsd }
        ↓
keccak256(deliverableContent) → deliverableHash
        ↓
ERC-8183 contract at 0x0747EEf0706327138c69792bF28Cd525089e4583 (Arc testnet)
  → createJob(sessionId, deliverableHash, escrowAmountUsdcE6)
        ↓
LedgerEvent: { eventKind: 'escrow_release', arcTxHash }
        ↓
SpecialistEscrowCard UI: 5-step timeline
  TRIGGERED → ESCROW CREATED → SPECIALIST REVIEWING → DELIVERABLE SUBMITTED → RELEASED
```

---

## State Management

Client state managed by Zustand with persist middleware (`useMeterStore`):

```typescript
interface MeterStore {
  // Session
  sessionId: string | null;
  sessionState: SessionState;  // 'idle' | 'parsing' | 'funding' | 'reviewing' | ...
  
  // Work order
  workOrder: WorkOrder | null;
  
  // Streaming
  reviewText: string;
  streamDone: boolean;
  
  // Ledger
  ledgerEvents: LedgerEvent[];
  frequencyStats: FrequencyStats;
  
  // Approval
  approvalRecord: ApprovalRecord | null;
  
  // Specialist escrow
  specialistJob: SpecialistJob | null;
  
  // Economic audit
  economicAudit: EconomicAudit | null;
  
  // Safe mode
  safeMode: boolean;
  budgetCapUsd: number;
}
```

---

## Database Schema

```sql
-- meter_work_orders
CREATE TABLE meter_work_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       TEXT NOT NULL DEFAULT 'demo',
  session_id      TEXT,
  request_id      TEXT NOT NULL,
  workflow_type   TEXT NOT NULL DEFAULT 'prior_auth_review',
  packet_format   TEXT NOT NULL,
  packet_summary  TEXT,
  policy_summary  TEXT,
  budget_cap_usd  NUMERIC(10,6) NOT NULL DEFAULT 0.50,
  approval_required BOOLEAN NOT NULL DEFAULT true,
  deidentified    BOOLEAN NOT NULL DEFAULT true,
  review_mode     TEXT NOT NULL DEFAULT 'live',
  execution_mode  TEXT NOT NULL DEFAULT 'live',
  tool_trace      TEXT[] DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'created',
  gemini_model    TEXT,
  healthcare_extract JSONB,  -- HealthcareExtract
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- meter_ledger_events
CREATE TABLE meter_ledger_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT NOT NULL,
  work_order_id   UUID REFERENCES meter_work_orders(id),
  event_kind      TEXT NOT NULL,
  chunk_index     INTEGER,
  tokens_estimate INTEGER,
  cost_usd        NUMERIC(20,12) NOT NULL DEFAULT 0,
  cost_usdc_e6    BIGINT NOT NULL DEFAULT 0,
  provisional     BOOLEAN NOT NULL DEFAULT true,
  arc_tx_hash     TEXT,
  arc_batch_id    TEXT,
  arc_block       BIGINT,
  proof_ref       TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## Arc Testnet Integration

| Property | Value |
|---|---|
| Chain ID | 5042002 |
| Native gas token | USDC (ERC-20) |
| USDC predeploy | `0x3600000000000000000000000000000000000000` |
| Block explorer | `https://testnet.arcscan.app` |
| Gas cost (typical) | $0.006 USDC per transaction |
| Finality | Sub-second, deterministic |

**Why USDC-as-gas matters:** On every other EVM chain, gas is paid in the chain's native token (ETH, MATIC, etc.) which requires users to hold a separate asset just to transact. Arc eliminates this friction entirely, if you have USDC, you can transact. For AI billing use cases where all pricing is USDC-denominated, this is not just a UX improvement, it's what makes the math work.

---

## Security & Compliance

- **No PHI ever enters Gemini:** All prompts are explicitly administrative-only. System instruction enforces non-clinical, non-PHI output.
- **Member IDs masked at extraction:** `parsePriorAuthDocument` tool definition specifies last-4-only masking.
- **Budget cap enforced per session:** `budgetCapUsd` checked against accumulated `totalCostUsd` before each ledger event.
- **Human-in-the-loop approval:** `ApprovalDecisionCard` always requires manual review before any output release.
- **Compliance boundary banner:** Persistent UI element clarifying this is an administrative workflow tool.

---

## Safe Mode

For demo environments or judging review without live API keys:

```bash
NEXT_PUBLIC_DEMO_MODE=safe
```

Replays a pre-recorded 55-chunk stream with real Arc testnet transaction references. Each chunk is emitted with correct timing, authentic event kinds, and real tx hashes from a prior live run. The demo is indistinguishable from live mode to observers.

---

## Deployment

```
Vercel → p402-router project
Branch: feat/arc-meter-healthcare-payerops
Domain: meter.p402.io (Cloudflare DNS, grey cloud → Vercel)
Output: standalone
```

Environment variables required in Vercel:
- `GOOGLE_API_KEY` (already present in p402-router project)
- `CIRCLE_API_KEY`
- `NANOPAYMENTS_API_BASE=https://gateway-api-testnet.circle.com`
- `DATABASE_URL` (Neon PostgreSQL)
