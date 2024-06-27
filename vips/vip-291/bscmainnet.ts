import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";

export const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

export const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const BTC_DISTRIBUTION_SPEED = parseUnits("27.7777777777", 10);

export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const ETH_DISTRIBUTION_SPEED = parseUnits("2752.7006172839", 10);

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDC_DISTRIBUTION_SPEED = parseUnits("11574074.074074074", 10);

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDT_DISTRIBUTION_SPEED = parseUnits("15432098.7654320987", 10);

const vip291 = () => {
  const meta = {
    version: "v2",
    title: "VIP-291 Prime Adjustment",
    description: `If passed, this VIP will follow the recommendations from the [Prime Adjustment Proposal - Q2 2024](https://community.venus.io/t/prime-adjustment-proposal-q2-2024/4273) ([snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x73f58f48f6950e162fc9b47e84f5fed96ce195f06ed19ab2a8a1f5766ccf8dc0)) and set the following Prime configuration (compared with the previous configuration, set in the [VIP-241](https://app.venus.io/#/governance/proposal/241?chainId=56)):

New reward distribution proposal (how the [income allocated to the Prime program](https://docs-v4.venus.io/governance/tokenomics#revenue-distribution-from-protocol-reserves) is distributed among the Prime markets):

- BTC: 5% (0%)
- ETH: 15% (-10%)
- USDC: 40% (+10%)
- USDT: 40% (0%)

3-month reward distribution recommendations (rewards to be distributed among Prime holders):

- BTC: 0.72 (-0.07)
- ETH: 71.35 (-1.04)
- USDC: 300,000 (+75,000)
- USDT: 400,000 (+100,000)

Total rewards for 3 months: $1,000,000. These funds are already available in the [PrimeLiquidityProvider](https://bscscan.com/address/0x23c4F844ffDdC6161174eB32c770D4D8C07833F2) contract, thanks to the [Automatic Income Allocation](https://docs-v4.venus.io/whats-new/automatic-income-allocation) system.

The token amounts have been adjusted based on token prices for April 01 2024, block number: 37463959

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/261)
- [Documentation](https://docs-v4.venus.io/whats-new/prime-yield)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 400, USDC_PRIME_CONVERTER],
            [0, 150, ETH_PRIME_CONVERTER],
          ],
        ],
      },
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
    ProposalType.FAST_TRACK,
  );
};

export default vip291;
