import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-547/utils/bsctestnet-addendum-2-cut-params.json";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";

export const vip547 = () => {
  const meta = {
    version: "v2",
    title: "Emode in the BNB Core Pool",
    description: "Emode in the BNB Core Pool",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [params],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip547;
