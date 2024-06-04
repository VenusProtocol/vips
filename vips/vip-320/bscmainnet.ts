import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vBNBAdmin = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const NEW_IR = "0xa741125f4d6b9777a115b326E577F9b4004CB481";

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
        signature: "setInterestRateModel(address)",
        params: [NEW_IR],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip320;
