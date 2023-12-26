import { cutParams as params } from "../../simulations/vip-223/vip-223/utils/cut-params.json";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const cutParams = params;

export const vip223 = () => {
  const meta = {
    version: "v2",
    title: "VIP-223 Fix on the Diamond Comptroller configuration",
    description: `In Diamond Proxy implementation of comptroller, Adding seizeVenus functionality that would allow Governance (VIP) to seize
    the XVS rewards allocated to one, or several users. The seizeVenus method is added as cut param to RewardFacet of Diamond proxy implementation.`,

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
