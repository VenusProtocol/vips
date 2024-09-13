import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const PCS = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const VAI = "0x4bd17003473389a42daf6a0a729f6fdb328bbbd7";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

export const vip108 = () => {
  const meta = {
    version: "v2",
    title: "VIP-108 Provide Liquidity in Pancake Swap",
    description: `
        withdraw 180K VAI to the Normal Timelock contract from the treasury
        withdraw 180K USDT to the Normal Timelock contract from the treasury
        provide liquidity in PCS (see this):
        approve 180K of the VAI balance in the contract to the PCS router
        approve 180K of the USDT balance in the contract to the PCS router
        invoke addLiquidity function on the PCS router, with the following parameters:
        tokenA: (VAI) 0x4bd17003473389a42daf6a0a729f6fdb328bbbd7
        tokenB: (USDT) 0x55d398326f99059ff775485246999027b3197955
        amountADesired: 180K
        amountBDesired: 180K
        amountAMin: 178.2K VAI (1 USDT = 0.99 VAI)
        amountBMin: 178.2K USDT (1 USDT = 1.01 VAI)
        to: (VTreasury) 0xf322942f644a996a617bd29c16bd7d231d9f35e9
        `,
    forDescription: "I agree that Venus Protocol should proceed with the Provide Liquidity in Pancake Swap",
    againstDescription: "I do not think that Venus Protocol should proceed with the Provide Liquidity in Pancake Swap",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with the Provide Liquidity in Pancake Swap or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VAI, parseUnits("180000", 18), NORMAL_TIMELOCK],
      },

      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("180000", 18), NORMAL_TIMELOCK],
      },

      {
        target: VAI,
        signature: "approve(address,uint256)",
        params: [PCS, parseUnits("180000", 18)],
      },
      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [PCS, parseUnits("180000", 18)],
      },

      {
        target: PCS,
        signature: "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)",
        params: [
          VAI,
          USDT,
          parseUnits("180000", 18),
          parseUnits("180000", 18),
          parseUnits("178200", 18),
          parseUnits("178200", 18),
          TREASURY,
          "1902129154",
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
