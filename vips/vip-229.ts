import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VAI_CONTROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";

export const vip229 = () => {
  const meta = {
    version: "v2",
    title: "VIP-229",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setVAIMintRate(uint256)",
        params: ["10000"],
      },
      {
        target: VAI_CONTROLLER,
        signature: "setMintCap(uint256)",
        params: [parseUnits("10000000", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
