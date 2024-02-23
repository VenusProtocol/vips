import { cutParams as params } from "../../simulations/vip-247/utils/cut-params.json";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const cutParams = params;

export const vip247 = () => {
  const meta = {
    version: "v2",
    title: "VIP-247 Unlist Market",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
