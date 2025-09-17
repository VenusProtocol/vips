import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const vUSDE = "0x86f8DfB7CA84455174EE9C3edd94867b51Da46BD";
export const vsUSDE = "0x8c8A1a0b6e1cb8058037F7bF24de6b79Aca5B7B0";

export const POOL_SPECS = {
  label: "Stablecoins",
  id: 1,
  markets: [vUSDE, vsUSDE],
  changeIsActiveTo: false,
};

export const vip545 = () => {
  const meta = {
    version: "v2",
    title: "Remove Stablecoins Emode Pool",
    description: `Remove Stablecoins Emode Pool`,
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
      ...POOL_SPECS.markets.map(market => {
        return {
          target: UNITROLLER,
          signature: "removePoolMarket(uint96,address)",
          params: [POOL_SPECS.id, market],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip545;
