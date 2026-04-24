# Circle Product Feedback

**Project:** P402 Meter  
**Track:** Usage-Based Compute Billing + B2B FinOps & Compliance  
**Circle Products Used:** Developer-Controlled Wallets, x402 Gateway API, Arc Testnet USDC

---

## What We Built With Circle

P402 Meter uses three Circle primitives as the payment substrate for per-token AI billing:

### 1. Circle Developer-Controlled Wallets

We provision one Circle Developer-Controlled Wallet per metered session via `POST /api/meter/fund`.
The wallet is created on the `ARC-TESTNET` network and funded with testnet USDC from the Circle faucet.

This wallet serves as the session spending account. In production, this model enables:
- Agent-specific budget caps per wallet
- Programmatic spend controls without user custody friction
- Auditable wallet-per-session provisioning visible in the Circle Developer Console

**Feedback:** The wallet creation API is clean and fast. The main friction point was finding the
correct network enum for `ARC-TESTNET` in the API docs. A dedicated "Arc testnet" quickstart in
the Circle docs would significantly reduce integration time for hackathon participants.

### 2. Circle x402 Gateway API

We use `gateway-api-testnet.circle.com` as the payment verification layer between the P402 Meter
backend and the Arc testnet settlement. Each ledger event is confirmed through the Gateway before
the Arc tx hash is returned.

**Feedback:** The x402 Gateway concept is excellent for AI agent payment flows. The biggest gap
we encountered was documentation around payment verification for non-standard token amounts
(sub-cent USDC values). For usage-based AI billing, amounts like $0.000006 USDC are common.
It would help to have explicit examples in the docs showing verification of payments below $0.001.

### 3. Arc Testnet USDC Settlement

Using USDC at the Arc predeploy address (`0x3600000000000000000000000000000000000000`) with
Circle's faucet funding enables a complete no-ETH payment loop. This is architecturally significant:
the entire session, from wallet provisioning to AI billing to onchain settlement, runs in pure USDC.

**Feedback:** The Arc predeploy address approach works well for hackathon demos but the gas
economics at `$0.006/tx` mean even testnet USDC from the faucet gets consumed in aggregate
for high-frequency demos. A higher-capacity faucet allocation (or a "batch mode" for hackathon
participants) would help stress-test the high-frequency settlement use case more thoroughly.

---

## What Worked Well

- Developer-Controlled Wallet provisioning is fast (<1s in testing)
- The Circle Developer Console provides clear visibility into wallet balances and transaction history
- The x402 payment model aligns naturally with AI agent billing patterns (request → authorize → settle)
- USDC-native settlement on Arc eliminates the ETH gas friction that makes per-token billing unviable on other chains

---

## What Could Be Better

1. **Arc testnet documentation gap:** There is no end-to-end quickstart showing Wallet → x402 Gateway → Arc settlement in one flow. This integration took significant trial and error.

2. **Sub-cent payment examples:** The docs and SDK examples use amounts in the $1-10 range. AI billing at $0.000006/token is a real use case that needs explicit support documentation.

3. **Webhook support for settlement confirmation:** Currently polling for transaction status. A webhook or SSE push from the Gateway when settlement confirms would simplify real-time billing applications significantly.

4. **Developer Console filtering:** After high-frequency demo runs (57 events per session), finding specific wallet transactions in the Console requires manual scrolling. Export to CSV or filtering by session wallet ID would help.

---

## Feature Requests

1. **Named wallet policies:** Ability to attach a spending policy (max per-tx, max daily) to a Developer-Controlled Wallet at creation time. Currently requires separate policy API calls.

2. **Batch settlement API:** For high-frequency AI billing (55+ events per session), a batch endpoint that accepts multiple small USDC amounts and processes them as one settlement would reduce gas overhead without requiring upstream batching logic.

3. **AI billing primitive:** A first-class API for "meter this session" that handles per-chunk cost accumulation, wallet deduction, and settlement in one call. P402 Meter built this manually — it should be a Circle product.

---

## Overall Assessment

Circle's infrastructure is the only viable payment rail for per-token AI billing at scale.
The combination of Developer-Controlled Wallets (session isolation), x402 Gateway (authorization),
and Arc USDC (sub-cent settlement) creates an architecture that is impossible to replicate on
any other payment stack. We are committed to building production applications on this foundation.
