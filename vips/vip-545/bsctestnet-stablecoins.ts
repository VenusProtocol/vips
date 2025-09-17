import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const vUSDE = "0x86f8DfB7CA84455174EE9C3edd94867b51Da46BD";
export const vsUSDE = "0x8c8A1a0b6e1cb8058037F7bF24de6b79Aca5B7B0";

export const POOL_SPECS = {
  label: "Stablecoins",
  id: 1,
  markets: [vUSDE, vsUSDE],
  marketsConfig: [
    {
      address: vUSDE,
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      liquidationIncentive: parseUnits("1.04", 18),
      borrowAllowed: true,
    },
    {
      address: vsUSDE,
      collateralFactor: parseUnits("0.7875", 18), // +5%
      liquidationThreshold: parseUnits("0.825", 18), // +10%
      liquidationIncentive: parseUnits("1.04", 18),
      borrowAllowed: false,
    },
  ],
};

export const vip545 = () => {
  const meta = {
    version: "v2",
    title: "Stablecoins Emode Pool",
    description: `Stablecoins Emode Pool`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "createPool(string)",
        params: [POOL_SPECS.label],
      },
      {
        target: UNITROLLER,
        signature: "addPoolMarkets(uint96[],address[])",
        params: [Array(POOL_SPECS.markets.length).fill(POOL_SPECS.id), POOL_SPECS.markets],
      },
      ...POOL_SPECS.marketsConfig.map(market => {
        return {
          target: UNITROLLER,
          signature: "setCollateralFactor(uint96,address,uint256,uint256)",
          params: [POOL_SPECS.id, market.address, market.collateralFactor, market.liquidationThreshold],
        };
      }),
      ...POOL_SPECS.marketsConfig.map(market => {
        return {
          target: UNITROLLER,
          signature: "setLiquidationIncentive(uint96,address,uint256)",
          params: [POOL_SPECS.id, market.address, market.liquidationIncentive],
        };
      }),
      ...POOL_SPECS.marketsConfig.map(market => {
        return {
          target: UNITROLLER,
          signature: "setIsBorrowAllowed(uint96,address,bool)",
          params: [POOL_SPECS.id, market.address, market.borrowAllowed],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip545;
