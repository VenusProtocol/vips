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

export const vip598 = () => {
  const meta = {
    version: "v2",
    title: "VIP-598 [BNB Chain] slisBNB Risk Parameters, March 2026 Prime Rewards, and Risk Stewards Update",
    description: `This VIP consolidates three governance initiatives on BNB Chain.

---

### 1. slisBNB Core Pool Risk Parameter Update

If passed, this VIP will update the risk parameters for the [slisBNB](https://bscscan.com/address/0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B) market in the Venus Core Pool on BNB Chain, enabling it as productive collateral to support BNB looping strategies for Binance Wallet users.

**Parameter Changes**

| Parameter | Current | New |
|---|---|---|
| Collateral Factor (CF) | 0% | 80% |
| Liquidation Threshold (LT) | 0% | 80% |
| Liquidation Incentive (LI) | 100% | 110% |

**Rationale**

- **Unlock utility for slisBNB**: Moving CF/LT from 0% to 80% allows slisBNB to be used as productive collateral in Core Pool, enabling users to borrow against their slisBNB holdings.
- **Support Binance Wallet-native looping**: Users can execute BNB looping strategies directly via Binance Wallet's distribution channel without switching platforms.
- **Maintain liquidation motivation**: LI of 110% provides sufficient incentive for liquidators during stress conditions. The 10% liquidation penalty balances protocol safety and user cost.

---

### 2. March 2026 Prime Rewards Adjustment

This VIP allocates Prime Rewards on BNB Chain for March 2026 based on available funds. In February 2026, Venus generated $143.6K in reserves revenue, of which $28.7K (20%) is allocated to Prime.

**Allocation strategy**

- Allocate $22K in Prime rewards (maintaining a 20% buffer for market price fluctuations).
- Rewards directed exclusively to USDT suppliers — focusing on the supply side strengthens liquidity and creates conditions for lower borrow rates.
- USDC distribution speed remains at 0 (unchanged from VIP-589).

Distribution speed: $22,000 over 31 days at 192,000 blocks/day ≈ 0.003696 USDT/block.

---

### 3. Risk Stewards Parameter Update

Following the [community recommendation](https://community.venus.io/t/risk-stewards-deployment-parameters-recommendation/5687), this VIP updates the Risk Stewards framework parameters on BNB Chain to better align debounce windows and safe delta bounds with the risk profile of each parameter type.

**Changes**

| Parameter | Old Debounce | New Debounce | Old Safe Delta | New Safe Delta |
|---|---|---|---|---|
| supplyCap | 259200 (3 days) | 86400 (24h) | 5000 bps (50%) | unchanged |
| borrowCap | 259200 (3 days) | 86400 (24h) | 5000 bps (50%) | unchanged |
| collateralFactors | 259200 (3 days) | 172800 (48h) | 1000 bps (10%) | 500 bps (5%) |
| interestRateModel | unchanged | unchanged | N/A | N/A |

**Rationale**

- **Supply/Borrow Caps (24h debounce):** Ceiling parameters that don't affect existing positions. Reducing debounce to 24h enables more responsive risk management.
- **Collateral Factors (48h debounce, 5% safe delta):** Directly affect liquidation eligibility. Tighter safe delta (5%) and longer debounce (48h) ensure meaningful changes remain subject to rigorous review. Any adjustment beyond 5% requires additional approval from the Venus whitelisted team.
- **Interest Rate Model:** No change — debounce remains at 3 days since new IRM contracts can contain arbitrary rate curve logic.

**Allez Labs Onboarding:** This VIP also onboards [Allez Labs](https://community.venus.io/t/proposed-risk-stewards-framework-for-more-efficient-risk-management/5606) (\`${ALLEZ_LABS}\`) as an authorized sender on the Risk Oracle, enabling them to publish risk parameter updates.`,
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
        params: [SUPPLY_CAP_CONFIG.updateType, SUPPLY_CAP_CONFIG.steward, SUPPLY_CAP_CONFIG.new.debounce, SUPPLY_CAP_CONFIG.new.timelock],
      },
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256,uint256)",
        params: [BORROW_CAP_CONFIG.updateType, BORROW_CAP_CONFIG.steward, BORROW_CAP_CONFIG.new.debounce, BORROW_CAP_CONFIG.new.timelock],
      },
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256,uint256)",
        params: [COLLATERAL_FACTORS_CONFIG.updateType, COLLATERAL_FACTORS_CONFIG.steward, COLLATERAL_FACTORS_CONFIG.new.debounce, COLLATERAL_FACTORS_CONFIG.new.timelock],
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip598;
