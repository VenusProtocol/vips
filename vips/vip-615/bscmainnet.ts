import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RISK_STEWARD_RECEIVER = "0x47856bFa74B71d24a5545c7506862B8FddE52baB";
export const MARKETCAP_STEWARD = "0x816FfD00A274EDE0091421F77817ca260Db3a3E3";
export const COLLATERALFACTORS_STEWARD = "0x1414ADf007E324ec1D0A77b9F1A8759Ad33d2879";
export const IRM_STEWARD = "0x8acaBc42Bb98E2e2b091902a7E23f60CcB730aaa";

const SIX_HOURS = 21600; // timelock — unchanged across all update types

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

export const vip615 = () => {
  const meta = {
    version: "v2",
    title: "VIP-615 [BNB Chain] Risk Stewards Parameter Update",
    description: `**Summary:**

Following the community recommendation in [Risk Stewards Deployment Parameters Recommendation](https://community.venus.io/t/risk-stewards-deployment-parameters-recommendation/5687), this VIP updates the Risk Stewards framework parameters on BNB Chain to better align debounce windows and safe delta bounds with the risk profile of each parameter type.

**Changes:**

| Parameter | Old Debounce | New Debounce | Old Safe Delta | New Safe Delta |
|---|---|---|---|---|
| supplyCap | 259200 (3 days) | 86400 (24h) | 5000 bps (50%) | unchanged |
| borrowCap | 259200 (3 days) | 86400 (24h) | 5000 bps (50%) | unchanged |
| collateralFactors | 259200 (3 days) | 172800 (48h) | 1000 bps (10%) | 500 bps (5%) |
| interestRateModel | unchanged | unchanged | N/A | N/A |

**Rationale:**

- **Supply/Borrow Caps (24h debounce):** Ceiling parameters that don't affect existing positions. Reducing the debounce to 24h enables more responsive risk management while the 24h frequency control prevents excessive compounding of adjustments.
- **Collateral Factors (48h debounce, 5% safe delta):** Directly determine how much a user can borrow and affect liquidation eligibility. Tighter safe delta (5%) and longer debounce (48h) ensure meaningful changes remain subject to rigorous review. Any adjustment beyond 5% will require additional approval from the Venus whitelisted team.
- **Interest Rate Model:** No change — the debounce remains at 72h since a new IRM contract can contain arbitrary rate curve logic, making automated safety assessment infeasible on-chain.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip615;
