import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER_GAMEFI = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
const vFLOKI_GAMEFI = "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb";

export const vip147 = () => {
  const meta = {
    version: "v2",
    title: "VIP-147 Risk Parameters Update",
    description: `
    FLOKI (GameFi pool):
      Supply cap: 22,000,000,000 -> 44,000,000,000
      `,
    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER_GAMEFI,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vFLOKI_GAMEFI], [parseUnits("44000000000", 9)]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
