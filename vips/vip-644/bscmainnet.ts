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
    title: "VIP-644 [BNB Chain] Fix DAI Market, Upgrade Institutional Fixed Rate Vault, and Pay Allez Labs Q3",
    description: `#### Summary

This VIP (1) stops DeviationSentinel monitoring of DAI, resumes vDAI borrowing and clears the related Emergency Brake snapshots, (2) upgrades the Institutional Fixed Rate Vault to an implementation that adds optional on-chain disclaimer-consent recording to the deposit/mint flow, and (3) transfers 105,000 USDC from the Venus Treasury to Allez Labs for Q3 2026 risk-management services, sourced by redeeming Treasury-held vUSDC.

#### Description

**Part 1 — DAI market.** DAI's thin, volatile DEX liquidity makes its price noisy against the ResilientOracle, repeatedly tripping DeviationSentinel false positives on vDAI (most recently last weekend). Monitoring is disabled and borrowing resumed; no collateral factor or cap is restored because EBrake never reduced any (vDAI's collateral factor was already 0).

**Part 2 — Fixed Rate Vault.** A new implementation adds depositWithConsent / mintWithConsent — ERC-4626 wrappers that emit ConsentRecorded (a zero hash skips it). Plain deposit/mint and existing vaults are unaffected; only vaults created after execution use it.

**Part 3 — Allez Labs Q3 payment.** Allez Labs provides risk-management services to Venus, billed quarterly in advance. This pays the Q3 2026 fee of 105,000 USDC ($35,000/month × 3, covering 26 July 2026 – 25 October 2026) — the same amount as the Q2 payment ([VIP-612](https://app.venus.io/#/governance/proposal/612?chainId=56)), paid in USDC. Because the Treasury's liquid USDC does not cover the amount, the USDC is sourced by redeeming Treasury-held vUSDC through the Token Redeemer, the same flow as [VIP-594](https://app.venus.io/#/governance/proposal/594?chainId=56): the redemption pays Allez Labs exactly 105,000 USDC and returns the unused vUSDC remainder to the Treasury. The vUSDC exchange rate only increases over time via interest accrual, so the withdrawn 3,960,000 vUSDC always covers the payment at execution time.

#### Actions

This VIP performs 8 actions on BNB Chain:

1. **Disable DeviationSentinel monitoring for DAI** — setTokenMonitoringEnabled(DAI, false) on DeviationSentinel (${DEVIATION_SENTINEL}), ordered first so vDAI cannot be re-tripped around execution.
2. **Resume borrowing on vDAI** — setActionsPaused([vDAI], [BORROW], false) on the Core Pool Comptroller (${bscmainnet.UNITROLLER}).
3. **Clear the vDAI Emergency Brake snapshots** — resetCFSnapshot, resetBorrowCapSnapshot and resetSupplyCapSnapshot(vDAI) on EBrake (${EBRAKE}).
4. **Upgrade the Fixed Rate Vault implementation** — setVaultImplementation(${NEW_VAULT_IMPLEMENTATION}) on the controller (${FIXED_RATE_VAULT_CONTROLLER}), replacing ${OLD_VAULT_IMPLEMENTATION}; only vaults cloned after execution use it.
5. **Withdraw vUSDC for the Allez Labs payment** — withdrawTreasuryBEP20(vUSDC, 3,960,000, TOKEN_REDEEMER) on the Venus Treasury (${bscmainnet.VTREASURY}), moving 3,960,000 vUSDC (${vUSDC}) to the Token Redeemer (${TOKEN_REDEEMER}).
6. **Pay Allez Labs for Q3 2026** — redeemUnderlyingAndTransfer on the Token Redeemer, redeeming exactly 105,000 USDC (${USDC}) to Allez Labs (${ALLEZ_LABS}) and returning the unused vUSDC remainder to the Venus Treasury.

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
