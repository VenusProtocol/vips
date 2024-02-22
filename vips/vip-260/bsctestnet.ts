import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const VAI = "0x5fFbE5302BadED40941A403228E6AD03f93752d9";
export const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
export const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";

export const vip260 = () => {
  const meta = {
    version: "v2",
    title: "VIP-260 Configure VAI Price",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [VAI, parseUnits("1", 18)],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            VAI,
            [
              CHAINLINK_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip260;
