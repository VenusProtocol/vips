import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";

export const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";

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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip289;
