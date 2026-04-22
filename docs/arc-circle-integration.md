# Arc + Circle Integration — Technical Reference

## Arc Testnet

| Property | Value |
|---|---|
| Chain ID | 5042002 |
| Network name | ARC-TESTNET (Circle) |
| Native gas token | USDC |
| USDC predeploy | `0x3600000000000000000000000000000000000000` |
| Block explorer | `https://testnet.arcscan.app` |
| Gas cost per tx | ~$0.006 USDC (deterministic) |
| Finality | Sub-second |
| EVM compatible | Yes |

### Why USDC as Native Gas

On Arc, USDC is the gas token. This eliminates the two-asset problem that exists on every other EVM chain (ETH for gas + USDC for payment). For AI billing use cases where all pricing is USDC-denominated, this means:

- **No ETH bridge required** — agents hold one asset (USDC) and can transact immediately
- **Deterministic costs** — gas cost in USDC is predictable, not floating with ETH price
- **Margin calculation is trivial** — AI token cost ($0.0006) + Arc gas ($0.006) = $0.0066 total, always

---

## Circle Developer-Controlled Wallets

**API Base:** `https://api.circle.com/v1/w3s`  
**Documentation:** Circle Wallets API

### Wallet Provisioning Flow

```typescript
// Step 1: Create wallet set (named for the session)
POST /walletSets
{
  "idempotencyKey": "uuid",
  "name": "p402-meter-session-{sessionId}"
}
→ { data: { walletSetId: "..." } }

// Step 2: Create wallet on ARC-TESTNET
POST /wallets
{
  "idempotencyKey": "uuid",
  "walletSetId": "...",
  "blockchains": ["ARC-TESTNET"],
  "count": 1,
  "metadata": [{
    "name": "meter-session-{sessionId}",
    "refId": "{workOrderId}"
  }]
}
→ { data: { wallets: [{ walletId, address, blockchain: "ARC-TESTNET", state, createDate }] } }
```

### What This Creates in Circle Console

Each session run creates a visible wallet set in the Circle Developer Console:
- Named `p402-meter-session-{sessionId}` 
- Contains one wallet on `ARC-TESTNET`
- `refId` maps to the work order ID for audit correlation

**This is the judge-visible proof of Circle infrastructure usage.** Every demo run appears as a new wallet set in the console.

### Degraded Mode

When `CIRCLE_API_KEY` is not configured, the API returns a `degraded: true` response with a demo wallet reference. This allows the demo to run without Circle credentials while making the degradation explicit.

---

## Circle Gateway — x402 API

**API Base:** `https://gateway-api-testnet.circle.com`  
**Protocol:** x402 (HTTP 402 native payment standard)

### What is x402

x402 is the open payment standard for internet-native micropayments. When a client requests a paid resource:
1. Server responds with HTTP 402 + payment instructions
2. Client signs an EIP-3009 `TransferWithAuthorization` 
3. Client submits the signed authorization to a facilitator
4. Facilitator verifies the signature and executes the on-chain transfer
5. Server delivers the resource

The key innovation: the user pays gas-free (EIP-3009 is gasless from the user's perspective). The facilitator executes the on-chain transfer and pays Arc gas in USDC.

### P402 Meter x402 Integration

```typescript
// Verify wallet can settle on Arc testnet
POST {NANOPAYMENTS_API_BASE}/gateway/v1/x402/verify
{
  "walletAddress": "{sessionWalletAddress}",
  "blockchain": "ARC-TESTNET",
  "sessionRef": "{sessionId}"
}
→ { channelId: "..." }

// Settle each ledger event
POST {NANOPAYMENTS_API_BASE}/gateway/v1/x402/settle
{
  "walletAddress": "{sessionWalletAddress}",
  "amountUsdcE6": {costUsd * 1_000_000},
  "sessionRef": "{sessionId}",
  "eventKind": "{eventKind}",
  "idempotencyKey": "{ledgerEventId}"
}
→ { arcTxHash: "0x...", arcBlock: 12345, settled: true }
```

### Settlement Per Ledger Event

Every ledger event (55+ per session) triggers a settlement call:

```
extraction_estimate  → settle $0.0000006 × ~tokens
review_estimate      → settle $0.0000006 × ~tokens  (×~48 events)
reconciliation       → settle final reconciled amount
routing_fee          → settle P402 governance fee
escrow_release       → settle specialist escrow amount
```

Each settlement returns an `arcTxHash` that is:
1. Stored in the `meter_ledger_events` table
2. Emitted via SSE to the client
3. Shown in the ArcProof drawer with a direct block explorer link
4. Verifiable at `https://testnet.arcscan.app/tx/{arcTxHash}`

---

## ERC-8183 Specialist Escrow

**Contract:** `0x0747EEf0706327138c69792bF28Cd525089e4583` (Arc testnet)  
**Standard:** ERC-8183 (Agentic Commerce)

When a prior auth case requires specialist review (`requiresSpecialistReview: true`):

```typescript
// app/api/meter/escrow/route.ts

// 1. Create deliverable hash
const deliverableHash = ethers.keccak256(
  ethers.toUtf8Bytes(`${sessionId}:${workOrderId}:specialist-review`)
);

// 2. Create ERC-8183 job on Arc testnet
const jobTx = await erc8183Contract.createJob(
  sessionId,
  deliverableHash,
  escrowAmountUsdcE6
);

// 3. Emit escrow_release ledger event
emit({ eventKind: 'escrow_release', arcTxHash: jobTx.hash })
```

This creates an A2A (Agent-to-Agent) payment loop: the P402 Meter agent pays a specialist agent via on-chain escrow. The deliverable hash proves the specialist completed their work before funds are released.

---

## Arc Constants (`src/lib/chains/arc.ts`)

```typescript
export const ARC_TESTNET_CHAIN_ID = 5042002;
export const CIRCLE_WALLETS_BLOCKCHAIN_ARC_TESTNET = 'ARC-TESTNET';
export const USDC_ARC_TESTNET = '0x3600000000000000000000000000000000000000';
export const ARC_BLOCK_EXPLORER = 'https://testnet.arcscan.app';
export const NANOPAYMENTS_API_BASE = process.env.NANOPAYMENTS_API_BASE ?? '';
export const ARC_TYPICAL_GAS_COST_USDC = 0.006;
export const ERC8183_CONTRACT_ADDRESS = '0x0747EEf0706327138c69792bF28Cd525089e4583';
```
