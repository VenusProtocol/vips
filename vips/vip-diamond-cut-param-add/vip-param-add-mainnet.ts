import { cutParams as params } from "../../simulations/vip-diamond-cut-param-add/vip-diamond-cut-param-mainnet/utils/cut-params.json";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const cutParams = params;

export const vipCutParamAdd = () => {
  const meta = {
    version: "v2",
    title: "VIP-Diamond-Cut-Param-Add",
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
