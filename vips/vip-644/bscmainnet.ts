import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// ── DAI market fix (VDB-24) ────────────────────────────────────────────────
// Core Pool market and its underlying
export const vDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
export const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";

// DeviationSentinel proxy (deployed in VIP-590, EBrake-integrated impl since VIP-610)
export const DEVIATION_SENTINEL = "0x6599C15cc8407046CD91E5c0F8B7f765fF914870";
// Emergency Brake (EBrakeV2) — holds the pre-incident CF/cap snapshots (VIP-610)
export const EBRAKE = "0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec";

// Comptroller Action enum: BORROW
export const BORROW = 2;

// ── Institutional Fixed Rate Vault implementation upgrade (VPD-1596) ───────
export const FIXED_RATE_VAULT_CONTROLLER = "0x6D9e91cB766259af42619c14c994E694E57e6E85";
export const OLD_VAULT_IMPLEMENTATION = "0xC25b2B657D24380eDd1a1Cff5296385541e85204";

// Adds depositWithConsent / mintWithConsent.
export const NEW_VAULT_IMPLEMENTATION = "0xe87A1eFCED88bBddf8CCF78EfB3bCF62cFdd5bdC";

// ── Allez Labs Q3 2026 payment (risk management services) ─────────────────
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8"; // vUSDC Core Pool
export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";
export const ALLEZ_LABS = "0x1757564C8C9a2c3cbE12620ea21B97d6E149F98e";

export const ALLEZ_LABS_USDC_AMOUNT = parseUnits("105000", 18);

// The treasury's liquid USDC (~86K) does not cover the payment, so the USDC is sourced
// by redeeming treasury vUSDC via the TokenRedeemer (same flow as VIP-594). ~3.96M vUSDC
// is withdrawn against a need of ~3,954,894 vUSDC at the authoring exchange rate
// (~0.02655 USDC per vUSDC); the rate only increases through interest accrual, so this
// amount always covers 105,000 USDC at execution time and the unused vUSDC remainder is
// returned to the treasury by the redeemer.
export const VUSDC_WITHDRAW_AMOUNT = parseUnits("3960000", 8);

export const vip644 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-644 [BNB Chain] Fix DAI market (disable DeviationSentinel monitoring, resume borrowing), upgrade Institutional Fixed Rate Vault implementation and pay Allez Labs Q3 2026 fees",
    description: `#### Summary

If passed, this VIP will (1) stop the DeviationSentinel from monitoring DAI, resume borrowing on the vDAI market and clear the related Emergency Brake snapshots, (2) point the Institutional Fixed Rate Vault controller at a new vault clone-source implementation that adds on-chain disclaimer-consent recording to the supplier deposit/mint flow, and (3) transfer 105,000 USDC from the Venus Treasury to Allez Labs for Q3 2026 risk management services, sourced by redeeming treasury vUSDC.

#### Part 1 — Fix the DAI market

DAI has thin, volatile DEX liquidity on BNB Chain. Because the DEX price of DAI is chronically noisy relative to the ResilientOracle price, the DeviationSentinel has repeatedly tripped false positives on the DAI market — most recently over the weekend, pausing borrowing on the vDAI market. As reliably configuring a deviation threshold for such a shallow pool is not practical, the risk team has decided to stop monitoring DAI with the DeviationSentinel.

**1. Disable DeviationSentinel monitoring for DAI**

- **Contract**: DeviationSentinel (${DEVIATION_SENTINEL})
- **Function**: setTokenMonitoringEnabled(address,bool)
- **Parameters**: token = DAI (${DAI}), enabled = false
- **Effect**: handleDeviation can no longer act on the vDAI market (it reverts TokenMonitoringDisabled). The stored deviation threshold for DAI is left unchanged. This is ordered first so the market cannot be re-tripped around execution.

**2. Resume borrowing on vDAI**

- **Contract**: Core Pool Comptroller (${bscmainnet.UNITROLLER})
- **Function**: setActionsPaused(address[],uint8[],bool)
- **Parameters**: markets = [vDAI], actions = [BORROW (2)], paused = false
- **Effect**: Users can borrow DAI again. The collateral factor of vDAI is **not** changed by this VIP: its pre-incident collateral factor was already 0 (which is why the EBrake collateral-factor snapshot for vDAI is empty — the sentinel only paused borrowing, it never lowered a non-zero collateral factor), so there is no collateral factor to restore. Likewise the borrow and supply caps were never reduced by EBrake (both cap snapshots are empty and the live caps are intact), so there are no caps to restore.

**3. Reset the DAI snapshots on EBrake**

- **Contract**: EBrake (${EBRAKE})
- **Functions**: resetCFSnapshot(address), resetBorrowCapSnapshot(address), resetSupplyCapSnapshot(address)
- **Parameters**: market = vDAI
- **Effect**: Clears any stored collateral-factor / borrow-cap / supply-cap snapshot for the vDAI market so EBrake tracks no residual state for DAI after monitoring is disabled.

#### Part 2 — Upgrade the Institutional Fixed Rate Vault implementation (consent recording)

The \`InstitutionalLoanVault\` implementation used by the controller (${FIXED_RATE_VAULT_CONTROLLER}) to clone new vaults is upgraded from ${OLD_VAULT_IMPLEMENTATION} to ${NEW_VAULT_IMPLEMENTATION}. The new implementation adds two supplier entrypoints:

- \`depositWithConsent(uint256 assets, address receiver, bytes32 consentHash)\` — a thin wrapper over ERC-4626 \`deposit\` that emits \`ConsentRecorded(supplier, receiver, consentHash)\`.
- \`mintWithConsent(uint256 shares, address receiver, bytes32 consentHash)\` — a thin wrapper over ERC-4626 \`mint\` that emits the same event.

The consent hash is optional: passing \`bytes32(0)\` skips the event and deposits/mints as usual. The plain \`deposit\`/\`mint\` entrypoints are unchanged. Existing vaults are immutable clones and are not modified; the change applies to vaults created from now on.

- **Action**: point the controller at the new vault implementation via \`setVaultImplementation(${NEW_VAULT_IMPLEMENTATION})\`.

#### Part 3 — Allez Labs Q3 2026 Risk Services Payment

Allez Labs provides risk management services to Venus Protocol. Per the contract terms, fees are paid quarterly in advance. This is the payment covering Q3 2026 (26 July 2026 – 25 October 2026), following the Q2 2026 payment executed in [VIP-612](https://app.venus.io/#/governance/proposal/612?chainId=56).

**Transfer Details**

- Amount: 105,000 USDC (at $35,000/month × 3 months)
- Source: Venus Treasury (${bscmainnet.VTREASURY}), by redeeming treasury-held vUSDC
- Destination: Allez Labs (${ALLEZ_LABS})

**Technical implementation.** The treasury's liquid USDC balance does not cover the payment, so this VIP uses the Token Redeemer (${TOKEN_REDEEMER}) to convert treasury vUSDC into USDC — the same flow as [VIP-594](https://app.venus.io/#/governance/proposal/594?chainId=56):

1. Withdraw 3,960,000 vUSDC (~105K USDC worth) from the Venus Treasury to the Token Redeemer.
2. Call \`redeemUnderlyingAndTransfer\`: redeems exactly 105,000 USDC and sends it to Allez Labs; the unused vUSDC remainder is returned to the Venus Treasury.

The vUSDC exchange rate (~0.02655 USDC per vUSDC at authoring) only increases over time via interest accrual, so 3,960,000 vUSDC always covers 105,000 USDC at execution time, and the amount received by Allez Labs is exact and deterministic.

No new AccessControlManager permissions are required — the Normal Timelock already holds all of the roles used by this proposal.

#### Voting options

- **For** — Execute the proposal
- **Against** — Do not execute the proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ────────────────────────────────────────────────────────────────────────
      // Part 1.1 — Disable DeviationSentinel monitoring for DAI (ordered first so
      //   the vDAI market cannot be re-tripped around execution).
      // ────────────────────────────────────────────────────────────────────────
      {
        target: DEVIATION_SENTINEL,
        signature: "setTokenMonitoringEnabled(address,bool)",
        params: [DAI, false],
      },

      // ────────────────────────────────────────────────────────────────────────
      // Part 1.2 — Resume borrowing on the vDAI market. No collateral-factor or
      //   cap commands: the pre-incident collateral factor was already 0 and the
      //   caps were never reduced (all EBrake snapshots for vDAI are empty).
      // ────────────────────────────────────────────────────────────────────────
      {
        target: bscmainnet.UNITROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[vDAI], [BORROW], false],
      },

      // ────────────────────────────────────────────────────────────────────────
      // Part 1.3 — Reset the EBrake snapshots for vDAI (clean, pre-incident slate).
      // ────────────────────────────────────────────────────────────────────────
      {
        target: EBRAKE,
        signature: "resetCFSnapshot(address)",
        params: [vDAI],
      },
      {
        target: EBRAKE,
        signature: "resetBorrowCapSnapshot(address)",
        params: [vDAI],
      },
      {
        target: EBRAKE,
        signature: "resetSupplyCapSnapshot(address)",
        params: [vDAI],
      },

      // ────────────────────────────────────────────────────────────────────────
      // Part 2 — Point the FRV controller at the consent-enabled vault
      //   implementation. Only affects vaults cloned from now on.
      // ────────────────────────────────────────────────────────────────────────
      {
        target: FIXED_RATE_VAULT_CONTROLLER,
        signature: "setVaultImplementation(address)",
        params: [NEW_VAULT_IMPLEMENTATION],
      },

      // ────────────────────────────────────────────────────────────────────────
      // Part 3 — Allez Labs Q3 2026 payment: withdraw vUSDC from the treasury to
      //   the Token Redeemer, redeem exactly 105,000 USDC to Allez Labs, and
      //   return the unused vUSDC remainder to the treasury (VIP-594 flow).
      // ────────────────────────────────────────────────────────────────────────
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vUSDC, VUSDC_WITHDRAW_AMOUNT, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
        params: [vUSDC, ALLEZ_LABS, ALLEZ_LABS_USDC_AMOUNT, bscmainnet.VTREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip644;
