import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";

export const POOL_SPECS = {
  label: "Spark",
  id: 2,
  changeIsActiveTo: false,
};

export const vip545 = () => {
  const meta = {
    version: "v2",
    title: "Remove Spark Emode Pool",
    description: `Remove Spark Emode Pool`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "setPoolActive(uint96,bool)",
        params: [POOL_SPECS.id, POOL_SPECS.changeIsActiveTo],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip545;
