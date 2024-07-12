import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

export const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
// assuming a block is mined every 3 seconds 10512000 yearly blocks; 2628000 quarterly blocks
// export const BTC_DISTRIBUTION_AMOUNT = parseUnits("0.81", 18);
export const BTC_DISTRIBUTION_SPEED = "308219178082" // 810000000000000000 / 2628000 = 308219178082

export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
// export const ETH_DISTRIBUTION_AMOUNT = parseUnits("45.92", 18);
export const ETH_DISTRIBUTION_SPEED = "17473363774733"; // 45920000000000000000 / 2628000 = 17473363774733

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
// export const USDC_DISTRIBUTION_AMOUNT = parseUnits("315000", 18);
export const USDC_DISTRIBUTION_SPEED = "119863013698630136" // 315000000000000000000000 / 2628000 = 119863013698630136

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
// export const USDT_DISTRIBUTION_AMOUNT = parseUnits("405000", 18);
export const USDT_DISTRIBUTION_SPEED = "154109589041095890"; // 405000000000000000000000 / 2628000 = 154109589041095890


const vip338 = () => {
  const meta = {
    version: "v2",
    title: "VIP-338 [BNB chain] : Correction of prime speeds",
    description: `Due to a library issue with handling Big Numbers/decimals in the previous [VIP-337](https://app.venus.io/#/governance/proposal/337?chainId=56), the Prime reward speeds were set lower than intended. To resolve this, we are deploying this VIP with hardcoded values to correct the Prime rewards distribution speed.

If passed this VIP will perform the following actions:

Hardcode the reward speeds for Prime markets on BNB Chain based on the following [snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xb688127908f595c0f60e28922a152bb00d9693d065dfb4760f6350aa6b9a92cc) and previous [VIP-337](https://app.venus.io/#/governance/proposal/337?chainId=56).

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/323)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: PLP,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [BTC, ETH, USDC, USDT],
          [BTC_DISTRIBUTION_SPEED, ETH_DISTRIBUTION_SPEED, USDC_DISTRIBUTION_SPEED, USDT_DISTRIBUTION_SPEED],
        ],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip338;
