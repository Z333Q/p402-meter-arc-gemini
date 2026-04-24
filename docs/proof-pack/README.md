# P402 Meter — Proof Pack

Session ID: `session_106e6747`  
Captured: 2026-04-24  
Mode: Proof Replay (Gemini stream pre-recorded, proof refs anchored to session)

---

## What Is In This Pack

| File | Description |
|---|---|
| `settlement-summary.md` | Human-readable session summary with cost breakdown and trail |
| `arcscan-links.md` | Arc block explorer verification links for all settlement events |
| `../proof-run-001.json` | Full machine-readable event log (57 events, all fields) |
| `../proof-run-001.csv` | Same events in tabular format for spreadsheet review |
| `circle-console-screenshots/` | Placeholder — screenshot your Circle Developer Console after a live run |

---

## How to Verify

### In Proof Replay Mode (no API keys required)
1. Go to [meter.p402.io](https://meter.p402.io)
2. Load any scenario from the Document Intake panel
3. Click Submit, then Execute Review
4. Watch 55+ ledger events populate in the Ledger pane
5. Open the ArcProof drawer — each reconciliation event shows a proof reference
6. All proof refs map to session `session_106e6747` in this pack

### In Live Mode (ARC_PRIVATE_KEY configured)
1. Clone the repo and add `ARC_PRIVATE_KEY` and `GOOGLE_API_KEY` to `.env.local`
2. Run `npm run dev` and open `http://localhost:3000/meter`
3. Each session gets a real Circle Developer-Controlled Wallet on Arc testnet
4. Each reconciliation event returns a real `arcTxHash` verifiable on ArcScan
5. The Circle Developer Console at [developers.circle.com](https://developers.circle.com) shows wallet provisioning

---

## The Claim

- **57 events** per prior authorization review session
- **$0.00052** total AI cost (412 tokens at $0.0000006/token)
- **$0.006** Arc settlement cost per reconciliation event
- **$0.30** Stripe minimum per transaction (structurally impossible for sub-cent billing)
- **$2.85** ETH mainnet equivalent (economically irrational)
- **>99.7%** cost reduction vs Ethereum mainnet

Every number in this claim is verifiable from the files in this pack.
