import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

export const BNB_BLOCKS_PER_QUARTER = 2628000;

export const BTC_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";

export const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";

export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";

export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";

export const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const BTC_DISTRIBUTION_AMOUNT = parseUnits("0.41", 18);
export const BTC_DISTRIBUTION_SPEED = BTC_DISTRIBUTION_AMOUNT.div(BNB_BLOCKS_PER_QUARTER);

export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const ETH_DISTRIBUTION_AMOUNT = parseUnits("30.24", 18);
export const ETH_DISTRIBUTION_SPEED = ETH_DISTRIBUTION_AMOUNT.div(BNB_BLOCKS_PER_QUARTER);

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDC_DISTRIBUTION_AMOUNT = parseUnits("157500", 18);
export const USDC_DISTRIBUTION_SPEED = USDC_DISTRIBUTION_AMOUNT.div(BNB_BLOCKS_PER_QUARTER);

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDT_DISTRIBUTION_AMOUNT = parseUnits("262500", 18);
export const USDT_DISTRIBUTION_SPEED = USDT_DISTRIBUTION_AMOUNT.div(BNB_BLOCKS_PER_QUARTER);

const vip381 = () => {
  const meta = {
    version: "v2",
    title: "VIP-381: [BNB Chain] Prime Adjustment Proposal - Q4 2024",
    description: `If passed, this VIP will perform the following actions following the Community proposal [Prime Adjustment Proposal - Q4 2024 [BNB Chain]](https://community.venus.io/t/prime-adjustment-proposal-q4-2024-bnb-chain/4598) and the associated [snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x71ed2e920b20172c439477f1b21f8c9822d9692d9bcc86abea931e3aab263ed7):

- Modify the reward speeds for Prime markets
- Modify the

In summary, the changes are the following:

New income distribution proposal (scoped to the 20% of the protocol reserves, allocated to Prime):

- BTC: 5% (0%)
- ETH: 15% (0%)
- USDC: 30% (-5%)
- USDT: 50% (+5%)

3-month reward distribution recommendations:

- BTC: 0.41 (-0.40)
- ETH: 30.24 (-15.68)
- USDC: 157,500 (-157,500)
- USDT: 262,500 (-142,500)
- Total rewards for 3 months: $525,000

#### References

- Community proposal “[Prime Adjustment Proposal - Q4 2024 [BNB Chain]](https://community.venus.io/t/prime-adjustment-proposal-q4-2024-bnb-chain/4598)”
- [VIP-337: Prime Adjustment Proposal - Q3 2024](https://app.venus.io/#/governance/proposal/337?chainId=56) (previous Prime adjustment)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/405)
- [Tokenomics](https://docs-v4.venus.io/governance/tokenomics)`,
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
            [0, 600, USDC_PRIME_CONVERTER],
            [0, 1000, USDT_PRIME_CONVERTER],
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

export default vip381;
