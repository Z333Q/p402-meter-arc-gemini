# ArcScan Verification Links

**Arc Testnet Block Explorer:** [testnet.arcscan.app](https://testnet.arcscan.app)  
**Arc Testnet Chain ID:** 5042002  
**USDC Predeploy:** `0x3600000000000000000000000000000000000000`

---

## How to Verify Live Session Transactions

In Live Mode, each session's reconciliation event returns a real `arcTxHash`.
To verify a transaction:

```
https://testnet.arcscan.app/tx/{arcTxHash}
```

The ArcProof drawer in the P402 Meter UI generates this link automatically for every
reconciliation event. Click any row in the Ledger pane with `provisional: false` to see it.

---

## Proof Replay Session References

Session `session_106e6747` used proof references, not live Arc tx hashes.
In Proof Replay mode, each event carries a `proofRef` in the format:

```
safe:{sessionId}:chunk:{chunkIndex}
```

These references are anchored to this session's audit log, not to live blockchain transactions.

To see live Arc transactions, run the demo with `ARC_PRIVATE_KEY` configured or view
the Arc testnet explorer directly:

- **Browse recent transactions:** [testnet.arcscan.app](https://testnet.arcscan.app)
- **Search by address:** [testnet.arcscan.app/address/0xFa772434DCe6ED78831EbC9eeAcbDF42E2A031a6](https://testnet.arcscan.app/address/0xFa772434DCe6ED78831EbC9eeAcbDF42E2A031a6)
- **P402 Treasury (recipient):** `0xFa772434DCe6ED78831EbC9eeAcbDF42E2A031a6`

---

## Circle Developer Console

Circle Developer-Controlled Wallets provisioned per session are visible at:
[developers.circle.com](https://developers.circle.com)

Each session wallet is provisioned on `ARC-TESTNET` network and contains a funded USDC balance
from the Circle testnet faucet. The wallet ID is returned by `POST /api/meter/fund` and displayed
in the CircleInfraStrip component on the demo page.

---

## Settlement Architecture

```
Gemini chunk emitted
        ↓
ledger event: estimate (provisional=true)
        ↓
Arc settler: USDC transfer to 0xFa77... via ethers.js
        ↓
Arc tx confirmed: arcTxHash + arcBlock returned
        ↓
ledger event: reconciliation (provisional=false, arcTxHash set)
        ↓
ArcScan link: https://testnet.arcscan.app/tx/{arcTxHash}
```

One Arc USDC transfer is executed per complete review session (not per chunk).
The 55 per-chunk estimate events are off-chain ledger records.
The final reconciliation event is the on-chain settlement.

---

## Verify the Math

Arc settlement cost for this session:
- 1 USDC transfer on Arc testnet
- Amount: AI compute cost ($0.000247) floored at $0.000001
- Arc gas: $0.006 USDC (Circle testnet faucet funded)
- Total including routing: $0.006347 USD

To verify any live session independently:
1. Get the `arcTxHash` from the ArcProof drawer
2. Go to `testnet.arcscan.app/tx/{arcTxHash}`
3. Confirm recipient = `0xFa772434DCe6ED78831EbC9eeAcbDF42E2A031a6`
4. Confirm token = USDC at `0x3600000000000000000000000000000000000000`
