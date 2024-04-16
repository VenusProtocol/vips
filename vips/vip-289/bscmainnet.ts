import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";

export const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

export const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const BTC_DISTRIBUTION_SPEED = parseUnits("27.7777777777", 10);

export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const ETH_DISTRIBUTION_SPEED = parseUnits("2752.7006172839", 10);

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDC_DISTRIBUTION_SPEED = parseUnits("11574074.074074073", 10);

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDT_DISTRIBUTION_SPEED = parseUnits("15432098.765432095", 10);

const vip289 = () => {
  const meta = {
    version: "v2",
    title: "VIP-289 Prime Adjustment",
    description: ``,
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

export default vip289;
