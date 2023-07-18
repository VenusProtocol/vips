import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const SD = "0x3bc5ac0dfdc871b365d159f728dd1b9a0b5481e8";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const MAX_STALE_PERIOD = 60 * 25;

export const vip141 = (maxStalePeriod?: number) => {
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
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["SD", maxStalePeriod || MAX_STALE_PERIOD],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            SD,
            [
              BINANCE_ORACLE,
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
