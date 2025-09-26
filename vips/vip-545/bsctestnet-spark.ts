import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const vBTC = "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe"; // underlying is BTCB
export const vUSDC = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
export const vUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";

export const POOL_SPECS = {
  label: "Spark",
  id: 2,
  markets: [vBTC, vUSDC, vUSDT],
  marketsConfig: [
    {
      address: vBTC,
      collateralFactor: parseUnits("0.84", 18), // +5%
      liquidationThreshold: parseUnits("0.88", 18), // +10%
      liquidationIncentive: parseUnits("1.04", 18),
      borrowAllowed: false,
    },
    {
      address: vUSDC,
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      liquidationIncentive: parseUnits("1.04", 18),
      borrowAllowed: true,
    },
    {
      address: vUSDT,
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      liquidationIncentive: parseUnits("1.04", 18),
      borrowAllowed: true,
    },
  ],
};

export const vip545 = () => {
  const meta = {
    version: "v2",
    title: "Spark Emode Pool",
    description: `Spark Emode Pool`,
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
