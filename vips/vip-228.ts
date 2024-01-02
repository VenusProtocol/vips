import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";

export const vip228 = () => {
  const meta = {
    version: "v2",
    title: "VIP-228 Reduce minting cap",
    description: `#### Summary`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setMintCap(uint256)",
        params: ["0"],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};
