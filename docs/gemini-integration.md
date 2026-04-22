# Gemini Integration — Deep Dive

## Overview

P402 Meter uses Gemini at three distinct layers. This document covers each integration in technical detail.

---

## Layer 1: Gemini Flash — Multimodal Document Intake

**File:** `src/lib/meter/work-order-parser.ts`  
**Model:** `gemini-2.0-flash`  
**Mode:** Function calling (AUTO), multimodal input

### What It Does

Takes a raw prior authorization packet (PDF, image, or text) and:
1. Extracts structured healthcare administrative fields
2. Determines session parameters (budget, routing mode, policy reference)
3. Creates an opening ledger estimate

### Function Calling Tools

```typescript
const workflowTools: FunctionDeclaration[] = [
  {
    name: 'parsePriorAuthDocument',
    // Extracts: payerName, memberIdMasked, providerName, procedureRequested,
    // diagnosisSummary, urgencyLevel, caseType, extractedConfidence,
    // requiresSpecialistReview, summary
  },
  {
    name: 'createReviewSession',
    // Determines: budgetCapUsd, approvalRequired, routingMode, policySummary
  },
  {
    name: 'addLedgerEstimate',
    // Records: tokensEstimate, costUsd, eventKind, sessionRef
  },
];
```

### Multimodal Input

```typescript
// For PDF/image uploads
const result = await model.generateContent([
  {
    inlineData: {
      mimeType: 'application/pdf',  // or image/jpeg, image/png, image/webp
      data: base64EncodedContent,
    },
  },
  { text: PARSE_PROMPT },
]);
```

### System Instruction

The model is instructed to extract administrative fields only — no PHI, no clinical decisions, no patient-identifiable information. The `memberIdMasked` field specification explicitly requires last-4-only format.

---

## Layer 2: Gemini Flash — Streaming Review + Per-Chunk Billing

**File:** `src/app/api/meter/chat/route.ts`  
**Model:** `gemini-2.0-flash`  
**Mode:** `generateContentStream`

### What It Does

Streams a utilization management review summary, emitting a ledger event with an Arc settlement for every token chunk received.

### Per-Chunk Billing Logic

```typescript
const COST_PER_TOKEN_USD = 0.000000600; // $0.60 per 1M output tokens

for await (const chunk of result.stream) {
  const text = chunk.text();
  const tokens = Math.max(1, Math.floor(text.length / 4));
  const chunkCostUsd = tokens * COST_PER_TOKEN_USD;
  
  // Determine event kind based on chunk position
  const eventKind: LedgerEventKind =
    chunkIndex < 3 ? 'extraction_estimate' :
    chunkIndex < 6 ? 'review_estimate' :
    'review_estimate';
  
  // Insert ledger event → settle on Arc
  const ledgerEvent = await insertLedgerEvent({
    sessionId, workOrderId, eventKind,
    chunkIndex, tokensEstimate: tokens,
    costUsd: chunkCostUsd,
    costUsdcE6: Math.round(chunkCostUsd * 1_000_000),
    provisional: true,
    arcTxHash: await settleChunkOnArc(sessionId, chunkCostUsd),
  });
  
  // Emit both events via SSE
  emit({ type: 'text_delta', delta: text });
  emit({ type: 'ledger_event', event: ledgerEvent });
  chunkIndex++;
}
```

### Healthcare System Instruction

```
You are a utilization management documentation assistant for healthcare payer operations.
Your job is to produce administrative review summaries based on de-identified 
prior authorization case packets.

Rules:
- ADMINISTRATIVE only — process-oriented, policy-referencing, non-clinical
- Do NOT make medical decisions, diagnoses, or treatment recommendations
- Do NOT reference specific patient names, member IDs, or any PHI
- Frame output as a utilization management documentation artifact ready for 
  human reviewer approval
- Include: request type, policy criteria reference, administrative rationale,
  and a clear recommendation for manual review
- Professional payer-operations language throughout
- Under 600 words
- End with "Ready for Manual Review" or "Escalation Recommended"
```

### Event Kinds Emitted During Streaming

| Event Kind | When Emitted | Description |
|---|---|---|
| `extraction_estimate` | Chunks 0–2 | Gemini multimodal parsing cost |
| `review_estimate` | Chunks 3–N | Per-chunk streaming review cost |
| `specialist_review_estimate` | If escalated | Specialist agent review cost |
| `reconciliation` | Stream end | Final reconcile event |
| `routing_fee` | Stream end | P402 governance overhead |

---

## Layer 3: Gemini Pro — Post-Run Economic Audit

**File:** `src/lib/meter/work-order-parser.ts` → `generateEconomicAudit()`  
**File:** `src/app/api/meter/audit/route.ts`  
**Model:** `gemini-2.0-pro-exp`  
**Mode:** Single-turn structured generation

### What It Does

After the review stream completes, Gemini Pro analyzes the full session cost data and produces:
1. Detailed cost breakdown (AI tokens / routing fee / Arc gas / escrow)
2. Comparison against Stripe and ETH mainnet (what those rails would have charged)
3. Percentage savings vs ETH mainnet (typically >99.7%)
4. Narrative recommendation on margin viability for production deployment

### Why Gemini Pro (Not Flash)

Flash is optimized for speed and streaming — ideal for the per-chunk billing loop. Pro is optimized for reasoning depth — ideal for cross-session economic analysis. Using both models demonstrates the full Gemini family and matches capability to task.

### Input to Gemini Pro

```typescript
const auditPrompt = `
You are a protocol economist analyzing real-time AI billing data for the P402 Meter system.

SESSION DATA (no PHI):
- Session ID: ${sessionId}
- Total cost: $${totalCostUsd.toFixed(6)}
- Arc transactions: ${arcTxCount}
- Cost breakdown:
  - AI token costs: $${aiTokenCostUsd.toFixed(6)}
  - Routing fees: $${routingFeeUsd.toFixed(6)}
  - Arc gas costs: $${arcGasCostUsd.toFixed(6)}
  - Escrow costs: $${escrowCostUsd.toFixed(6)}

Analyze:
1. Cost structure efficiency — is the AI-to-gas ratio optimal?
2. Arc vs ETH mainnet comparison — what would this run have cost on ETH?
3. Arc vs Stripe — what would Stripe's minimum fee structure have charged?
4. Margin viability — at what volume does this model become profitable?
5. Production recommendation — what would need to change for production deployment?

Provide a professional economic analysis suitable for a technical audience.
`;
```

### Output: EconomicAudit

```typescript
interface EconomicAudit {
  sessionId: string;
  totalCostUsd: number;
  costBreakdown: {
    aiTokenCostUsd: number;
    routingFeeUsd: number;
    arcGasCostUsd: number;
    escrowCostUsd: number;
  };
  arcTxCount: number;
  avgCostPerActionUsd: number;
  comparisonStripeUsd: number;       // Stripe minimum for same run
  comparisonEthMainnetUsd: number;   // ETH gas equivalent
  savingVsEthMainnetPct: number;     // typically >99.7%
  recommendation: string;            // Gemini Pro narrative
  model: 'gemini-2.0-pro';
  createdAt: string;
}
```

---

## Google AI Studio

All Gemini integrations in P402 Meter were developed and validated in Google AI Studio before integration:

1. **Function calling schema design** — tested `parsePriorAuthDocument` tool parameters against real prior auth packet formats
2. **System instruction tuning** — validated the healthcare administrative system prompt for PHI avoidance and output format
3. **Multimodal testing** — verified PDF and image intake with `inlineData` format
4. **Economic audit prompt** — iteratively refined the Gemini Pro prompt for structured output quality

The production integration uses the `@google/generative-ai` SDK directly.
