import { cutParams as params } from "../../simulations/vip-181/vip-181-testnet/utils/cut-params.json";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const cutParams = params;

export const vip181Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-181 Add cut param to Diamond Comptroller",
    description: `In Diamond Proxy implementation of comptroller, Adding function signature for venusInitialIndex 
                  as cut param to the Market Facet`,

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
