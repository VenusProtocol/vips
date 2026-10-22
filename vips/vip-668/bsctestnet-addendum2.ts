import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { SPOKE_COMPTROLLER_BEACON, SPOKE_COMPTROLLER_IMPL_ADDENDUM2 } from "./addresses/bsctestnet";

export const vip668Addendum2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-668 addendum 2 [BNB Chain Testnet] Spoke comptroller upgrade with audit fixes",
    description: `#### Summary

If passed, this proposal will upgrade the Hub-Funded Spoke comptroller beacon on BNB Chain Testnet to a new \`SpokeComptroller\` implementation that carries the fixes from the Bailsec and Sherlock audits.

#### Details

The new implementation:

- Rejects a liquidation threshold and liquidation incentive whose product is 1 or more, in both \`setCollateralFactor\` and \`setMarketLiquidationIncentive\`, with \`UnsafeLiquidationParams\`.
- Stops \`healAccount\` while liquidations are paused in a market the account borrows from.
- Rounds heal repayments up and computes seized collateral with a single division.

Storage layout is unchanged, so every value already set on the pool is preserved. The beacon is owned by the Normal Timelock, so the upgrade needs no ACM permission.

#### References

- VIP-668, the original listing: https://github.com/VenusProtocol/vips/pull/762
- Spoke pool contracts: https://github.com/VenusProtocol/isolated-pools/pull/565`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: SPOKE_COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [SPOKE_COMPTROLLER_IMPL_ADDENDUM2],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip668Addendum2;
