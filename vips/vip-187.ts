import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const VAIController = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export const vip187 = () => {
  const meta = {
    version: "v2",
    title: "VIP-187 Risk Parameters Update",
    description: ``,

    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: VAIController,
        signature: "setMintCap(uint256)",
        params: ["10000000000000000000000000"],
      },

      {
        target: UNITROLLER,
        signature: "_setVAIMintRate(uint256)",
        params: [parseUnits("1", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
