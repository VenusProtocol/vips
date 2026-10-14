import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  COLLATERALFACTORS_STEWARD,
  IRM_STEWARD,
  MARKETCAP_STEWARD,
  RISK_ORACLE,
  RISK_STEWARD_RECEIVER,
} from "../vip-592/bscmainnet";
import { ACM } from "../vip-671/addresses/bscmainnet";

// ===================================================================================================
// VIP-672 [BNB Chain] — the Risk Stewards on the Hub-Funded Spoke pool. Mainnet twin of ./bsctestnet.ts.
//
// The receiver, oracle and three stewards are the VIP-592 deployments. Wildcards name no spoke
// contract, so nothing here waits on the spoke deployment; propose once the pool exists (after VIP-C).
// ===================================================================================================

export { RISK_ORACLE, RISK_STEWARD_RECEIVER };

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
  { role: SET_COLLATERAL_FACTOR, account: COLLATERALFACTORS_STEWARD },
  { role: SET_MARKET_SUPPLY_CAPS, account: MARKETCAP_STEWARD },
  { role: SET_MARKET_BORROW_CAPS, account: MARKETCAP_STEWARD },
  { role: SET_INTEREST_RATE_MODEL, account: IRM_STEWARD },
];

export const vip672Bscmainnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-672 [BNB Chain] Risk Stewards on the Hub-Funded Spoke pool",
    description: `#### Summary

If passed, this proposal will let the Risk Stewards manage the Hub-Funded Spoke pool on BNB Chain the way they manage the Core and isolated pools: collateral factor, supply cap, borrow cap and interest rate model updates published to the Risk Oracle will be applied to the spoke markets through \`RiskStewardReceiver\`, without a proposal or a Guardian transaction.

#### Details

The proposal grants, as ACM wildcards (address(0), so the grant applies on every contract that checks the signature):

- \`setCollateralFactor(address,uint256,uint256)\` to \`CollateralFactorsRiskSteward\`
- \`setMarketSupplyCaps(address[],uint256[])\` and \`setMarketBorrowCaps(address[],uint256[])\` to \`MarketCapsRiskSteward\`

and, on each spoke market, \`setInterestRateModel(address)\` to \`IRMRiskSteward\`.

Because they are wildcards, the stewards can also apply these updates on any isolated pool. The Core pool is unaffected: its setters have different signatures. The comptroller's own checks still apply to a steward update: a liquidation threshold below the collateral factor, or one whose product with the market's liquidation incentive reaches 1, reverts it.

#### References

- VIP-671, the Hub-Funded Spoke pool: https://github.com/VenusProtocol/vips/pull/762
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

export default vip672Bscmainnet;
