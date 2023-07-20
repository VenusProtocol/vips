import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const SD = "0xac7d6b77ebd1db8c5a9f0896e5eb5d485cb677b3";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";

export const vip141Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-141 Add Stader Price Feed",
    description: `
      Configured Binance and Resilient Oracle for SD Price
    `,
    forDescription: "I agree that Venus Protocol should proceed with the adding of SD price feed",
    againstDescription: "I do not think that Venus Protocol should proceed with the adding of SD price feed",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the adding of SD price feed",
  };

  return makeProposal(
    [
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [SD, "920136040000000000"],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            SD,
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
