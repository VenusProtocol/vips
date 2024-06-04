import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vBNBAdmin = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const NEW_IR = "0xeE9B16469D69A397A74C35D3Fb7Ba188659FeF94";

const vip320 = () => {
  const meta = {
    version: "v2",
    title: "VIP-320",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: vBNBAdmin,
        signature: "_setInterestRateModel(address)",
        params: [NEW_IR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip320;