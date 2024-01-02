import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const VAI_CONTROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";

export const vip228 = () => {
  const meta = {
    version: "v2",
    title: "VIP-228",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VAI_CONTROLLER,
        signature: "setMintCap(uint256)",
        params: ["0"],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};
