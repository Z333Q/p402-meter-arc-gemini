# Circle Product Feedback

**Project:** P402 Meter
**Tracks:** Usage-Based Compute Billing · B2B FinOps & Compliance · Best Use of Gemini Models

---

## Products Used

- **Arc Testnet** — Chain ID 5042002, USDC as native gas currency
- **USDC on Arc** — predeploy at `0x3600000000000000000000000000000000000000`, Circle Faucet funded
- **Circle Developer-Controlled Wallets** — wallet-per-session provisioning via `POST /v1/w3s/walletSets` + `POST /v1/w3s/wallets` with `blockchains: ["ARC-TESTNET"]`
- **Circle Gateway (x402)** — evaluated for nanopayment channel verification; integrated as optional authorization layer
- **Circle Faucet** — testnet USDC sourcing at `faucet.circle.com`
- **Circle Developer Console** — wallet visibility and transaction history during development and demo

---

## Use Case

P402 Meter tests a specific question: can AI work be priced and settled at the same granularity at which it is consumed?

Most AI products bill through subscriptions, prepaid credits, or opaque usage dashboards. That model works for SaaS. It breaks for agentic systems. AI agents call tools, stream tokens, trigger multi-step workflows, and create many small economic events. Each action needs a price, a policy, and a receipt.

Our demo runs a synthetic healthcare prior authorization workflow — document-heavy, audit-heavy, operationally expensive — through a sequence of Gemini AI calls: classification, clinical review, policy check, and economic audit. Each meaningful work unit becomes a metered ledger event. A single session generates 55–57 billing events at approximately $0.000006 USDC each, totaling under $0.01. Circle infrastructure provides the wallet layer, settlement layer, and transaction proof layer for all of them.

We chose Circle because this architecture requires:

- **Session-specific wallets** for agent and workflow isolation
- **Sub-cent USDC pricing** with six-decimal precision
- **Programmable authorization and settlement** without ETH gas friction
- **Auditability** through wallet and transaction history
- **A payment model suited to AI agents, APIs, and B2B FinOps**

Arc is essential because the economics of usage-based AI billing break on traditional rails. Card networks, Stripe, and most L1 chains make sub-cent settlement uneconomic. Arc lets the cost model stay close to the AI usage model.

---

## What Worked Well

**Developer-Controlled Wallet provisioning is fast and clean.** Wallet creation completes in under 800ms. For a real-time demo where the judge is watching, this is fast enough to feel instant. The idempotency key pattern (`X-Request-Id` / `idempotencyKey`) worked correctly across our retry logic — no duplicate wallets, no extra state management required.

**The Circle Developer Console is useful for operational proof.** Wallet balances and transaction history are immediately visible after provisioning. For a payment infrastructure demo, visible proof matters. A judge can open the Console during a live run and see the wallet created for their session in real time.

**USDC-native settlement on Arc is the strongest architectural primitive.** It removes the mental and technical overhead of ETH gas, token bridging, and mixed-unit accounting. The demo is easy to explain: AI work is priced in dollars, funded in USDC, settled in USDC, and audited in USDC. No conversion layer, no gas estimation in ETH, no bridge hop.

**The wallet-per-session model maps perfectly to AI agent systems.** Each session has a clean financial boundary. Budget isolation, spend audit, and per-workflow accounting become natural consequences of the architecture rather than bolt-ons.

**Circle Faucet was reliable throughout the build.** Consistent availability under hackathon time pressure mattered.

---

## Challenges

### 1. The Arc USDC predeploy is not a standard ERC-20 — and this is not documented clearly

This was our most significant technical blocker, and the most important feedback we can give.

The predeploy at `0x3600000000000000000000000000000000000000` exposes `balanceOf()` as a view function, which works correctly for balance reads. We reasonably assumed it also accepted standard ERC-20 `transfer(address, uint256)` calls. It does not. Calling `transfer()` via an ERC-20 ABI appears to succeed — the transaction lands on chain without reverting — but no funds move, and the transfer produces no error to surface the problem.

We spent several hours debugging why Arc transactions were appearing to submit correctly but never appearing on ArcScan. The fix: on Arc, USDC is the *native* currency, exactly like ETH on Ethereum. Transfers use the transaction's `value` field, not a contract call:

```typescript
// Wrong — ERC-20 transfer() silently does nothing on Arc
const usdc = new ethers.Contract(USDC_ARC_TESTNET, ERC20_ABI, signer);
await usdc.transfer(recipient, amountE6); // ← submits, doesn't move funds

// Correct — native value transfer (USDC is Arc's gas token)
await signer.sendTransaction({
  to: recipient,
  value: amountE6,      // USDC in e6 units, same as ETH in wei
  gasLimit: 21000n,     // standard native transfer gas
});
```

The Arc docs mention "interact via Circle Wallets' createContractExecutionTransaction (not vanilla ERC-20)" but this refers to a specific API method, not to the general principle that USDC is the native gas token and transfers use the `value` field. A single explicit sentence — *"To send USDC between addresses, use a native value transfer; ERC-20 `transfer()` is not supported at the predeploy"* — would have saved significant debugging time and will save every team building on Arc from hitting the same wall.

### 2. `getFeeData()` is unreliable on Arc

Calling `provider.getFeeData()` on Arc's RPC throws intermittently or returns a null `gasPrice`. Our fix was to wrap in try/catch and omit `gasPrice` from the transaction when the call fails — Arc selects a reasonable fee automatically. This behavior should be documented alongside the Arc RPC endpoint reference.

### 3. Two-step wallet creation adds latency to session start

Creating a session wallet requires two sequential API calls — `POST /v1/w3s/walletSets`, then `POST /v1/w3s/wallets`. For a demo where the user is actively watching, this adds approximately 1.5s to session initialization. A composite call or a `createWalletSet: true` parameter on `POST /v1/w3s/wallets` would improve real-time UX.

### 4. The `ARC-TESTNET` blockchain identifier string is not surfaced prominently

The correct value to pass in `blockchains: ["ARC-TESTNET"]` required checking across multiple docs pages and community threads to confirm. A dedicated Arc integration page in the Circle Wallets docs — with the network identifier, Chain ID (5042002), native currency unit, and RPC endpoints in one place — would eliminate this friction.

### 5. No end-to-end quickstart for the Wallet → Gateway → Arc settlement flow

Arc, Developer-Controlled Wallets, Gateway, Nanopayments, x402, Faucet funding, and ArcScan verification each make sense individually. Assembling them into one coherent payment flow required significant trial and error. There is no single reference that shows all of these working together.

### 6. Sub-cent payment documentation is absent

Every example in Circle's docs and SDK uses amounts in the $1–$10 range. AI billing at $0.000006/token is a real production use case. Six-decimal USDC handling, minimum viable amounts, rounding rules, and batching strategies for sub-cent events need explicit documentation.

### 7. Developer Console filtering breaks down at high event volume

At 57 events per demo session, locating specific wallet transactions in the Console requires manual scrolling. There is no filter by wallet address, session metadata, amount range, or date. Export to CSV or JSON is not available. For production AI billing or hackathon judging this is a meaningful gap.

### 8. Faucet allocation is consumed quickly at high event frequency

At $0.006 per settlement × 57 events per session, each full demo run costs $0.34 in gas. Our 40 USDC faucet balance supports approximately 114 full sessions. For a hackathon where judges may run the demo multiple times, a larger per-project allocation or an automated top-up API would allow more thorough stress testing.

---

## Recommendations

**1. Publish an Arc AI billing quickstart**
A complete starter repo: wallet creation → faucet funding → Gateway verification → USDC settlement on Arc → 50+ microtransaction simulation → ArcScan links → budget cap enforcement → session receipt. This would be the single highest-leverage developer experience investment Circle could make for the agentic payments category.

**2. Document Arc USDC native transfer explicitly**
Add a dedicated section to the Arc developer docs and the Circle Wallets Arc integration page explaining that USDC is the native gas token, that ERC-20 `transfer()` does not work at the predeploy, and that the correct transfer pattern uses the transaction's `value` field with `gasLimit: 21000`. Include a code example.

**3. Add sub-cent payment examples**
Document USDC payments below $0.01: six-decimal handling, minimum practical settlement values, rounding rules, and batching strategies. Include examples at $0.006/action, $0.0001/tool-call, and $0.000006/token granularity.

**4. Single-call wallet provisioning**
`POST /v1/w3s/wallets` should accept `createWalletSet: true` and handle the two-step flow server-side, returning both `walletSetId` and `walletId` in one response. Reduces latency and API surface.

**5. Named wallet policies at creation time**
Allow spending policies to be attached during wallet creation — `max_per_transaction`, `max_per_session`, `max_daily`, `allowed_network`, `require_approval_above`. For agentic commerce, wallet policy is core safety infrastructure, not a secondary concern.

**6. Metadata fields for session labeling**
Support developer-defined metadata on wallets and transactions: `session_id`, `agent_id`, `workflow_id`, `customer_id`, `ledger_event_id`, `pricing_model`. This makes filtering, reconciliation, and audit tractable at scale.

**7. Settlement webhooks or SSE**
A webhook or server-sent event for payment status changes would eliminate polling and enable real-time billing UX. Suggested event types:
- `payment.estimated` · `payment.authorized` · `payment.verified` · `payment.settled` · `payment.failed`
- `wallet.funded` · `wallet.low_balance`

**8. Proof export from Developer Console and API**
Allow developers to export transaction proof as JSON or CSV. Useful fields: wallet ID, session metadata, amount, currency, network, gateway request ID, transaction hash, block number, timestamp, status, ArcScan URL. Essential for hackathon judging, enterprise pilots, and finance reconciliation.

**9. Batch settlement API**
A `POST /arc/batch-settle` endpoint that accepts an array of `{ to, amountUsdc_e6, metadata }` entries and processes them efficiently on chain. Preserve itemized ledger entries while reducing gas overhead for high-frequency billing.

**10. AI agent payments reference architecture**
Publish a reference architecture covering: agent identity → session wallet → budget cap → payment authorization → Gateway verification → USDC settlement → refunds/reversals → human approval gate → audit receipt → failure handling. This would help teams move from hackathon demos to production systems.

---

## Overall Assessment

Circle and Arc are the correct foundation for per-token AI billing. The combination of session-isolated Developer-Controlled Wallets, Arc's USDC-native gas model, and sub-second settlement creates an architecture that is not replicable on any other payment stack. ETH gas costs alone make sub-cent billing ($0.000006 events) economically impossible on every other chain we evaluated.

P402 Meter showed that an AI workflow can become an economic stream: each action has a price, each session has a wallet, each workflow has a budget, and each payment has a receipt. This is the right architecture for agentic commerce.

The primary investment needed is documentation depth around Arc-specific behaviors — the native USDC transfer model above all else — combined with tooling for the high-frequency billing use case: metadata, filtering, export, webhooks, and batch settlement. The primitives are already excellent. Developers need clearer templates and stronger operational tooling to ship production systems on top of them.

Circle is well positioned to define the payment standard for AI agents. Every AI action should have a price, a policy, and a receipt. We are building P402's production AI payment router on this foundation and are committed to the long term.
