import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// -------------------------------------------------------
// VIP-598-A: slisBNB Core Pool Risk Parameter Update
// -------------------------------------------------------
export const vslisBNB = "0x89c910Eb8c90df818b4649b508Ba22130Dc73Adc";
export const NEW_CF = parseUnits("0.8", 18);
export const NEW_LT = parseUnits("0.8", 18);
export const NEW_LI = parseUnits("1.1", 18);

// -------------------------------------------------------
// VIP-598-B: March 2026 Prime Rewards Adjustment
// -------------------------------------------------------
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
/// assume 192000 blocks per Day
/// 0.003696236559139785 * (192000 * 31 days) = 22,000 USD
export const NEW_PRIME_SPEED_FOR_USDT = parseUnits("0.003696236559139785", 18);

// -------------------------------------------------------
// VIP-598-C: Risk Stewards Parameter Update
// -------------------------------------------------------
export const RISK_ORACLE = "0x0E3E51958b0Daa8C57c949675975CBEDd7b5a1a1";
export const RISK_STEWARD_RECEIVER = "0x47856bFa74B71d24a5545c7506862B8FddE52baB";
export const MARKETCAP_STEWARD = "0x816FfD00A274EDE0091421F77817ca260Db3a3E3";
export const COLLATERALFACTORS_STEWARD = "0x1414ADf007E324ec1D0A77b9F1A8759Ad33d2879";
export const IRM_STEWARD = "0x8acaBc42Bb98E2e2b091902a7E23f60CcB730aaa";
export const ALLEZ_LABS = "0xcF2c06dDd24dd92EC35f60Bab9D7f206330e2abE";

const SIX_HOURS = 21600;

export const SUPPLY_CAP_CONFIG = {
  updateType: "supplyCap",
  steward: MARKETCAP_STEWARD,
  old: { debounce: 259200, timelock: SIX_HOURS }, // debounce: 3 days
  new: { debounce: 86400, timelock: SIX_HOURS }, // debounce: 24h
} as const;

export const BORROW_CAP_CONFIG = {
  updateType: "borrowCap",
  steward: MARKETCAP_STEWARD,
  old: { debounce: 259200, timelock: SIX_HOURS }, // debounce: 3 days
  new: { debounce: 86400, timelock: SIX_HOURS }, // debounce: 24h
} as const;

export const COLLATERAL_FACTORS_CONFIG = {
  updateType: "collateralFactors",
  steward: COLLATERALFACTORS_STEWARD,
  old: { debounce: 259200, timelock: SIX_HOURS, safeDeltaBps: 1000 }, // debounce: 3 days, delta: 10%
  new: { debounce: 172800, timelock: SIX_HOURS, safeDeltaBps: 500 }, // debounce: 48h,    delta: 5%
} as const;

export const IRM_CONFIG = {
  updateType: "interestRateModel",
  steward: IRM_STEWARD,
  old: { debounce: 259200, timelock: SIX_HOURS }, // debounce: 3 days — unchanged by this VIP
} as const;

// MC steward safe delta is not changed by this VIP — exported for simulation sanity check
export const MARKETCAP_STEWARD_SAFE_DELTA = 5000; // 50%

// -------------------------------------------------------
// VIP-598-D: Flux Flash Loan Aggregator Whitelist
// -------------------------------------------------------
export const FLUX_FLA = "0xe620726686B480d955E63b9c7c1f93c2f8c1aCf4";

export const vip598 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-598 [BNB Chain] Risk Parameter Updates, Prime Rewards Allocation, slisBNB Update, and Flux Flash Loan Whitelist",
    description: `#### Summary

If passed, this VIP will implement several operational updates on BNB Chain to improve risk management, optimize Prime rewards distribution, enable **slisBNB** as collateral in the Core Pool, and whitelist the **Flux Flash Loan Aggregator** to use Venus's native flash loan infrastructure.

#### Description

This proposal introduces four protocol updates on BNB Chain:

1. **Risk Steward Framework Update** – Onboard **Allez Labs** as Risk Steward and update the framework parameters governing risk adjustments.
2. **Prime Rewards Allocation (March 2026)** – Allocate **$22,000 in Prime rewards** to **USDT suppliers on BNB Chain**.
3. **slisBNB Core Pool Update** – Enable **slisBNB** as collateral in the Core Pool.
4. **Flux Flash Loan Aggregator Whitelist** – Allow the Flux aggregator to access Venus's native flash loan contract.

These changes aim to improve operational efficiency, strengthen liquidity incentives, and expand protocol integrations.

#### Proposed Changes

#### 1. Risk Steward Onboarding

Whitelist **Allez Labs** as Risk Steward.

- **Address:** ${ALLEZ_LABS}

Updated Risk Steward parameters:

- **Supply Cap** — Safe Delta: 50%, Debounce: 24 hours, Timelock: 6 hours
- **Borrow Cap** — Safe Delta: 50%, Debounce: 24 hours, Timelock: 6 hours
- **Collateral Factors** — Safe Delta: 5%, Debounce: 48 hours, Timelock: 6 hours
- **Interest Rate Model** — Safe Delta: N/A, Debounce: 72 hours, Timelock: 6 hours

- **Safe Delta**: the maximum relative change that executes immediately without a timelock. Changes exceeding this threshold are registered on-chain and subject to the timelock period.
- **Debounce**: the minimum time that must elapse after the last executed update before a new update of the same type can be registered for the same market.
- **Timelock**: the waiting period between when a non-safe update is registered on-chain and when it becomes eligible for execution by a whitelisted executor.

#### 2. Prime Rewards Allocation — March 2026

- Allocate **$22,000 in Prime rewards**, distributed to **USDT suppliers on BNB Chain**
- Above allocation accounts for a **20% reserve buffer** to avoid full depletion due to market price fluctuations

#### 3. slisBNB Core Pool Parameter Update

- **Collateral Factor** — Current: 0%, Proposed: 80%
- **Liquidation Threshold** — Current: 0%, Proposed: 80%
- **Liquidation Penalty** — Current: 0%, Proposed: 10%
- **Liquidation Incentive** — Current: 100%, Proposed: 110%

This enables **slisBNB** as collateral in the Core Pool.

#### 4. Flux Flash Loan Aggregator Whitelist

Whitelist the **Flux Flash Loan Aggregator**:

- **Address:** ${FLUX_FLA}

This allows Flux to use Venus's native flash loan contract and removes reliance on external providers charging a **0.05% fee**.

#### Conclusion

If approved, this VIP will:

- Onboard **Allez Labs** as Risk Steward and update the risk steward framework
- Allocate **$22K Prime rewards** to **USDT suppliers on BNB Chain**
- Enable **slisBNB as Core Pool collateral**
- Whitelist the **Flux Flash Loan Aggregator** for Venus native flash loans

These updates improve risk operations, liquidity incentives, collateral utility, and protocol integrations on Venus.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // -------------------------------------------------------
      // VIP-598-A: slisBNB Core Pool Risk Parameter Update
      // -------------------------------------------------------
      {
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vslisBNB, NEW_CF, NEW_LT],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(address,uint256)",
        params: [vslisBNB, NEW_LI],
      },

      // -------------------------------------------------------
      // VIP-598-B: March 2026 Prime Rewards Adjustment
      // -------------------------------------------------------
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [[USDT], [NEW_PRIME_SPEED_FOR_USDT]],
      },

      // -------------------------------------------------------
      // VIP-598-C: Risk Stewards Parameter Update
      // -------------------------------------------------------
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256,uint256)",
        params: [
          SUPPLY_CAP_CONFIG.updateType,
          SUPPLY_CAP_CONFIG.steward,
          SUPPLY_CAP_CONFIG.new.debounce,
          SUPPLY_CAP_CONFIG.new.timelock,
        ],
      },
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256,uint256)",
        params: [
          BORROW_CAP_CONFIG.updateType,
          BORROW_CAP_CONFIG.steward,
          BORROW_CAP_CONFIG.new.debounce,
          BORROW_CAP_CONFIG.new.timelock,
        ],
      },
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256,uint256)",
        params: [
          COLLATERAL_FACTORS_CONFIG.updateType,
          COLLATERAL_FACTORS_CONFIG.steward,
          COLLATERAL_FACTORS_CONFIG.new.debounce,
          COLLATERAL_FACTORS_CONFIG.new.timelock,
        ],
      },
      {
        target: COLLATERALFACTORS_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [COLLATERAL_FACTORS_CONFIG.new.safeDeltaBps],
      },
      {
        target: RISK_ORACLE,
        signature: "addAuthorizedSender(address)",
        params: [ALLEZ_LABS],
      },

      // -------------------------------------------------------
      // VIP-598-D: Flux Flash Loan Aggregator Whitelist
      // -------------------------------------------------------
      {
        target: bscmainnet.UNITROLLER,
        signature: "setWhiteListFlashLoanAccount(address,bool)",
        params: [FLUX_FLA, true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip598;
