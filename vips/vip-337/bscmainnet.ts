import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BNB_BLOCKS_PER_YEAR = parseUnits("10512000", 1); // assuming a block is mined every 3 seconds
export const BNB_BLOCKS_PER_QUARTER = BNB_BLOCKS_PER_YEAR.div(4);

export const BTC_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";

export const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";

export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";

export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";

export const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

export const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const BTC_DISTRIBUTION_AMOUNT = parseUnits("0.81", 18);
export const BTC_DISTRIBUTION_SPEED = BTC_DISTRIBUTION_AMOUNT.div(BNB_BLOCKS_PER_QUARTER);

export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const ETH_DISTRIBUTION_AMOUNT = parseUnits("45.92", 18);
export const ETH_DISTRIBUTION_SPEED = ETH_DISTRIBUTION_AMOUNT.div(BNB_BLOCKS_PER_QUARTER);

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDC_DISTRIBUTION_AMOUNT = parseUnits("315000", 18);
export const USDC_DISTRIBUTION_SPEED = USDC_DISTRIBUTION_AMOUNT.div(BNB_BLOCKS_PER_QUARTER);

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDT_DISTRIBUTION_AMOUNT = parseUnits("405000", 18);
export const USDT_DISTRIBUTION_SPEED = USDT_DISTRIBUTION_AMOUNT.div(BNB_BLOCKS_PER_QUARTER);

export const COMMUNITY_WALLET = "0xc444949e0054a23c44fc45789738bdf64aed2391";

const vip337 = () => {
  const meta = {
    version: "v2",
    title: "VIP-337 Prime Adjustment Proposal - Q3 2024",
    description: `If passed this VIP will perform the following actions:

  - Modify the reward speeds for Prime markets based on the following [snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xb688127908f595c0f60e28922a152bb00d9693d065dfb4760f6350aa6b9a92cc).
  - Collect BBTC Tokens from the Eth [Prime Liquidity Provider](https://etherscan.io/address/0x8ba6affd0e7bcd0028d1639225c84ddcf53d8872) contract and send them to the [Community wallet](https://bscscan.com/address/${COMMUNITY_WALLET}) for them to be swapped for WBTC and sent back to the same contract on Ethereum.

It was previously suggested to increase the amount of Prime tokens by 50 but in view of the Community’s comments on the Forum and in the Venus telegram groups, **no changes will be made to the number of Prime Tokens at this time** and they will be kept at 500 until a vote is held by the community in the future.

In summary, the changes are the following:

New reward distribution proposal:
  - BTC: 5% (0%)
  - ETH: 15% (0%)
  - USDC: 35% (-5%)
  - USDT: 45% (+5%)

3-month reward distribution recommendations:
  - BTC: 0.81 (+0.09)
  - ETH: 45.92 (-25.43)
  - USDC: 315,000 (+15,000)
  - USDT: 405,000 (+5,000)
    - Total rewards for 3 months: $900,000

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xe09e4e745d6ec24347cb1a11515bbbe0440b5b210d66cb39946d7e69e0591cef) multisig transaction will be executed. Otherwise, it will be rejected.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/320)`,
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
            [0, 100, BTC_PRIME_CONVERTER],
            [0, 300, ETH_PRIME_CONVERTER],
            [0, 700, USDC_PRIME_CONVERTER],
            [0, 900, USDT_PRIME_CONVERTER],
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

export default vip337;
