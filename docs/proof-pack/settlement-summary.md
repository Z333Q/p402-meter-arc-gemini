# Session Settlement Summary

**Session ID:** `session_106e6747`  
**Demo URL:** [meter.p402.io](https://meter.p402.io)  
**Captured:** 2026-04-24T06:41:18.666Z  
**Mode:** Proof Replay (historical Arc tx references)

---

## Event Count

| Event Kind | Count | Notes |
|---|---|---|
| `estimate` | 55 | One per Gemini output chunk (streaming) |
| `reconciliation` | 1 | Final verified token count + Arc settlement |
| `routing_fee` | 1 | P402 routing overhead |
| **Total** | **57** | All events written to persistent audit log |

---

## Cost Breakdown

| Item | Amount |
|---|---|
| Gemini output tokens | 412 tokens |
| Cost per token | $0.0000006 USD |
| AI compute cost | $0.000247 USD |
| Arc settlement fee | $0.006 USDC |
| P402 routing fee | $0.000100 USD |
| **Session total** | **$0.006347 USD** |

---

## Cost Comparison

| Payment Rail | Cost per Action | Viable for Sub-Cent Billing? |
|---|---|---|
| Arc (this session) | **$0.006** | Yes |
| Ethereum mainnet | $2.85 | No — costs more than the AI work |
| Stripe | $0.30 minimum | No — requires batching 300+ actions |
| Base L2 | ~$0.02 | No — still 3x the token cost |

**Arc is the only rail where every individual token chunk can settle individually.**

---

## Approval Gate Output

```json
{
  "recommendation": "approve_for_manual_review",
  "insideBudget": true,
  "policyCompliant": true,
  "outputInScope": true,
  "reasonSummary": "Review completed within budget. Administrative documentation complete. Ready for manual approval."
}
```

---

## Ledger Event Sample (first 5)

| Index | Kind | Tokens | Cost USD | Proof Ref |
|---|---|---|---|---|
| 1 | estimate | 10 | $0.000006 | safe:session_106e6747:chunk:1 |
| 2 | estimate | 15 | $0.000009 | safe:session_106e6747:chunk:2 |
| 3 | estimate | 15 | $0.000009 | safe:session_106e6747:chunk:3 |
| 4 | estimate | 7 | $0.0000036 | safe:session_106e6747:chunk:4 |
| 5 | estimate | 8 | $0.0000048 | safe:session_106e6747:chunk:5 |

Full event log: [`proof-run-001.json`](../proof-run-001.json) (57 events, machine-readable)

---

## What Happens in Live Mode

When `ARC_PRIVATE_KEY` and `GOOGLE_API_KEY` are configured:

1. Gemini 3.1 Flash is called live — no pre-recorded stream
2. A Circle Developer-Controlled Wallet is provisioned per session via `POST /api/meter/fund`
3. The Arc settler calls `settleOnArcWithFallback()` after the stream completes
4. The reconciliation event receives a real `arcTxHash` and `arcBlock`
5. The ArcProof drawer shows a live ArcScan block explorer link

The proof refs in this pack (`safe:session_106e6747:chunk:N`) become real Arc tx hashes
in Live Mode. The session architecture, event count, and cost structure remain identical.
