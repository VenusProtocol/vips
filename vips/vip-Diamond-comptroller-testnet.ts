import { cutParams as params } from "../simulations/vip-diamond-comptroller-testnet/utils/cut-params-testnet.json";
import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const DIAMOND_CUT_FACET = "0x69Ca940186C29b6a9D64e1Be1C59fb7A466354E2";
const DIAMOND = "0xF6A9DBc8453EB8b1528B6Cd3f08eC632134f831F";
const DIAMOND_INIT = "0x6D7f7Ed4EbD3A1807d5fe8EE70c155bcAc8174Af";
const cutParams = params;

export const vipDiamondTestnet = () => {
  const meta = {
    version: "v1",
    title: "VIP Comptroller Diamond proxy",
    description: `This vip implement diamond proxy for the comptroller to divide the comptroller logic into facets. The current implementation of the comptroller is exceeding the max limit of the contract size. To resolve this diamond proxy is implemented.`,
    forDescription:
      "I agree that Venus Protocol should proceed with the upgrading the Comptroller contract with diamond proxy",
    againstDescription: "I do not think that Venus Protocol should proceed with the Comptroller contract upgradation",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Comptroller upgradation or not",
  };

  const initFunctionEncode = "0xe1c7392a";

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [DIAMOND],
      },
      {
        target: DIAMOND,
        signature: "_become()",
        params: [],
      },
      {
        target: UNITROLLER,
        signature: "facetCutInitilizer(address)",
        params: [DIAMOND_CUT_FACET],
      },
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[],address,bytes)",
        params: [cutParams, DIAMOND_INIT, initFunctionEncode],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
