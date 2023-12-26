import { cutParams as params } from "../../simulations/vip-223/vip-223-testnet/utils/cut-params.json";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const cutParams = params;

export const vip223Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-223 New seizeVenus functionality",
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
