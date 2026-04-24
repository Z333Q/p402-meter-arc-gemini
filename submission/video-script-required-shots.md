# Video Script — Required Shots Checklist

Per hackathon requirements, the submission video must show a USDC transaction processed
end-to-end using Circle infrastructure and Arc settlement.

**Full 90-second narrated script:** [VIDEO_SCRIPT.md](../VIDEO_SCRIPT.md)

---

## Required Shot List

### Shot 1: Open Demo Page [0:00]
**URL:** meter.p402.io  
**What to show:** Full page load, headline visible: "AI Thinking Has a Price. Watch It Settle on Arc."  
**Narration:** "This is P402 Meter, running live on Arc testnet."

### Shot 2: Start Live Run [0:10]
**Action:** Click any scenario row in the Document Intake panel to load the case text  
**Or:** Click "Run Full Demo →" in the GuidedDemoStrip for one-click path  
**Narration:** "I'm loading a prior authorization case. Gemini Flash is about to parse it."

### Shot 3: Gemini Extraction [0:20]
**What to show:** WorkOrderCard populating with extracted fields  
**Key elements:** Payer name, procedure, urgency level, case type, confidence score  
**Narration:** "Three Gemini function calls. Structured extraction. All typed fields. No free-form guessing."

### Shot 4: Cost Ledger Incrementing [0:35]
**What to show:** LedgerPane rows appearing in real time, FrequencyCounter incrementing  
**Key elements:** Yellow estimate rows, cost values, event count climbing  
**Narration:** "Every row in the ledger is an Arc transaction. Watch the cost tick up per token."

### Shot 5: Circle Developer Console [0:50]
**What to show:** Circle Developer Console at developers.circle.com (new tab)  
**Key elements:** Developer-Controlled Wallet provisioned on ARC-TESTNET, wallet balance, transaction log  
**Narration:** "This session's Circle wallet. Provisioned on Arc testnet. Real USDC balance. Every transfer visible here."  
**Tip:** Keep the Circle Console tab open before starting the demo

### Shot 6: Arc Block Explorer [1:00]
**Action:** Click any `arcTxHash` link in the ArcProof drawer (or open testnet.arcscan.app)  
**What to show:** Arc transaction detail page with USDC transfer, block number, timestamp  
**Narration:** "Here's the Arc block explorer. This transaction settled 30 seconds ago. $0.006 USDC."

### Shot 7: 50+ Transaction Counter [1:10]
**What to show:** FrequencyCounter widget, "50-tx Threshold PASS" indicator lit  
**Key numbers:** Event count, total cost, average cost per event  
**Narration:** "Fifty-seven onchain events. Average cost: under half a cent. Total: under a dollar."

### Shot 8: Margin Table [1:20]
**What to show:** MarginExplanationPanel with comparison table  
**Key elements:** Arc $0.006 vs Stripe $0.30 vs ETH $2.85  
**Narration:** "This is why Arc. Every other payment rail makes per-token billing mathematically impossible."

### Shot 9: Business Use Case [1:28]
**What to show:** ApprovalDecisionCard with recommendation, or scroll to EconomicAuditPanel  
**Narration:** "Prior authorization review: $150 per manual case. AI-metered on Arc: under a cent.  
That is the business case. P402 Meter. meter.p402.io."

---

## Pre-Recording Checklist

- [ ] meter.p402.io open in Chrome, full screen
- [ ] Circle Developer Console open in second tab, logged in
- [ ] testnet.arcscan.app open in third tab
- [ ] Browser zoom at 90% so all panels fit
- [ ] Proof Replay banner visible (thin dark bar at top) or Live Mode confirmed
- [ ] Sample scenario pre-loaded in Document Intake panel
- [ ] Screen recording at 1920×1080

---

## Mode Notes

**Proof Replay (default):** Amber "Proof Replay" banner at top. Demo runs identically to Live Mode
but Gemini stream is pre-recorded and Arc tx hashes are proof refs, not live hashes. The Circle
Console will not show new wallet activity in this mode.

**Live Mode (recommended for video):** Set `GOOGLE_API_KEY` and `ARC_PRIVATE_KEY` in `.env.local`.
The Proof Replay banner disappears. Live Gemini calls, real Circle wallet provisioned, real Arc tx hash
returned. Circle Console shows the new wallet. ArcScan shows the real transaction.

For the submission video, **Live Mode produces more compelling footage** because Shot 5 (Circle
Console) and Shot 6 (ArcScan) show real activity, not proof refs.
