import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const vBTC = "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe";
export const vUSDC = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
export const vUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";

export const POOL_SPECS = {
  label: "Spark",
  id: 2,
  markets: [vBTC, vUSDC, vUSDT],
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
