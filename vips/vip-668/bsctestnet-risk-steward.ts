import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ACM } from "./addresses/bsctestnet";

// ===================================================================================================
// VIP-668 [BNB Chain Testnet] — the Risk Stewards on the Hub-Funded Spoke pool.
//
// `CollateralFactorsRiskSteward`, `MarketCapsRiskSteward` and `IRMRiskSteward` take the isolated-pool path for
// any comptroller that is not the Core one, and `SpokeComptroller` keeps the setters and getters that path
// calls, so no steward change is needed: only the ACM grants, which the stewards hold on no spoke contract
// today, as a grant or as a wildcard (verified on chain for all four roles). `RiskStewardReceiver` keys its
// configs on the update type, not the market, so the four live configs cover these markets once granted.
//
// All four roles are granted as address(0) wildcards, so they reach every contract that checks the same
// signature: this pool's comptroller and markets, and every isolated pool's. The Core pool is unaffected, its
// setters are the `_set*` forms VIP-592 granted exactly.
// ===================================================================================================

/// The risk stewards, from governance-contracts deployments/bsctestnet.
export const RISK_STEWARD_RECEIVER = "0x2F6eb64826f3A067eBFFb5909De7AA4e0Cb31b81";
export const MARKET_CAPS_RISK_STEWARD = "0xecC583037338D1EFE2C15bb2c6ac81E0294375C2";
export const COLLATERAL_FACTORS_RISK_STEWARD = "0xBf821F512EA224201108303cc6dA200391Eb38aC";
export const IRM_RISK_STEWARD = "0xE7AcaF3d6CeBA793d94f867FFCE0A1e9a6b3977C";

/// ACM wildcard: the grant applies on every contract.
export const ANY_CONTRACT = "0x0000000000000000000000000000000000000000";

export const SET_COLLATERAL_FACTOR = "setCollateralFactor(address,uint256,uint256)";
export const SET_MARKET_SUPPLY_CAPS = "setMarketSupplyCaps(address[],uint256[])";
export const SET_MARKET_BORROW_CAPS = "setMarketBorrowCaps(address[],uint256[])";
export const SET_INTEREST_RATE_MODEL = "setInterestRateModel(address)";

const giveCallPermission = (contract: string, role: string, account: string) => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, role, account],
});

/// One wildcard per role.
export const STEWARD_GRANTS = [
  { role: SET_COLLATERAL_FACTOR, account: COLLATERAL_FACTORS_RISK_STEWARD },
  { role: SET_MARKET_SUPPLY_CAPS, account: MARKET_CAPS_RISK_STEWARD },
  { role: SET_MARKET_BORROW_CAPS, account: MARKET_CAPS_RISK_STEWARD },
  { role: SET_INTEREST_RATE_MODEL, account: IRM_RISK_STEWARD },
];

export const vip668RiskSteward = () => {
  const meta = {
    version: "v2",
    title: "VIP-668 [BNB Chain Testnet] Risk Stewards on the Hub-Funded Spoke pool",
    description: `#### Summary

If passed, this proposal will let the Risk Stewards manage the Hub-Funded Spoke pool on BNB Chain Testnet the way they manage the Core and isolated pools: collateral factor, supply cap, borrow cap and interest rate model updates published to the Risk Oracle will be applied to the spoke markets through \`RiskStewardReceiver\`, without a proposal or a Guardian transaction.

#### Details

The proposal grants, as ACM wildcards (address(0), so the grant applies on every contract that checks the signature):

- \`setCollateralFactor(address,uint256,uint256)\` to \`CollateralFactorsRiskSteward\`
- \`setMarketSupplyCaps(address[],uint256[])\` and \`setMarketBorrowCaps(address[],uint256[])\` to \`MarketCapsRiskSteward\`

and, on each of the five spoke markets, \`setInterestRateModel(address)\` to \`IRMRiskSteward\`.

Because they are wildcards, the stewards can also apply these updates on any isolated pool. The Core pool is unaffected: its setters have different signatures. The comptroller's own checks still apply to a steward update: a liquidation threshold below the collateral factor, or one whose product with the market's liquidation incentive reaches 1, reverts it.

#### References

- VIP-668, the original listing: https://github.com/VenusProtocol/vips/pull/762
- Risk Stewards framework (VIP-592): https://github.com/VenusProtocol/vips/pull/619`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    STEWARD_GRANTS.map(({ role, account }) => giveCallPermission(ANY_CONTRACT, role, account)),
    meta,
    ProposalType.REGULAR,
  );
};

export default vip668RiskSteward;
