import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const DeFi_Pool = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const vANKR_DeFi = "0x19CE11C8817a1828D1d357DFBF62dCf5b0B2A362";
const vBSW_DeFi = "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379";
const vALPACA_DeFi = "0x02c5Fb0F26761093D297165e902e96D08576D344";
const vUSDT_DeFi = "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854";
const vUSDD_DeFi = "0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0";

const GameFi_Pool = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
const vFLOKI_GameFi = "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb";
const vRACA_GameFi = "0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465";
const vUSDT_GameFi = "0x4978591f17670A846137d9d613e333C38dc68A37";
const vUSDD_GameFi = "0x9f2FD23bd0A5E08C5f2b9DD6CF9C96Bfb5fA515C";

const LiquidStakedBNB_Pool = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
const vankrBNB_LiquidStakedBNB = "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f";
const vBNBx_LiquidStakedBNB = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
const vstkBNB_LiquidStakedBNB = "0xcc5D9e502574cda17215E70bC0B4546663785227";
const vWBNB_LiquidStakedBNB = "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2";

const StableCoin_Pool = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
const vHAY_Stablecoins = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";
const vUSDT_Stablecoins = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
const vUSDD_Stablecoins = "0xc3a45ad8812189cAb659aD99E64B1376f6aCD035";

const Tron_Pool = "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0";
const vBTT_Tron = "0x49c26e12959345472E2Fd95E5f79F8381058d3Ee";
const vWIN_Tron = "0xb114cfA615c828D88021a41bFc524B800E64a9D5";
const vTRX_Tron = "0x836beb2cB723C498136e1119248436A645845F4E";
const vUSDT_Tron = "0x281E5378f99A4bc55b295ABc0A3E7eD32Deba059";
const vUSDD_Tron = "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7";

const vUSDT_DeFi_Rate_Model = "0x009cdfb248e021f58a34b50dc2a7601ea72d14ac";
const vUSDD_DeFi_Rate_Model = "0xd9d10f63d736dc2d5271ce7e94c4b07e114d7c76";
const vUSDT_GameFi_Rate_Model = "0x009cdfb248e021f58a34b50dc2a7601ea72d14ac";
const vUSDD_GameFi_Rate_Model = "0xd9d10f63d736dc2d5271ce7e94c4b07e114d7c76";
const vWBNB_LiquidStakedBNB_Rate_Model = "0x6765202c3e6d3fdd05f0b26105d0c8df59d3efaf";
const vHAY_Stablecoins_Rate_Model = "0xcaaa2ae0a8f30f0bf76568b3764fd639b5171a59";
const vUSDT_Stablecoins_Rate_Model = "0xf63bcb7b4b72fe5b26318098d5f38499710ba731";
const vUSDD_Stablecoins_Rate_Model = "0x12d290de159341d36bb1a5a58904ad95053bdb20";
const vUSDT_Tron_Rate_Model = "0x009cdfb248e021f58a34b50dc2a7601ea72d14ac";
const vUSDD_Tron_Rate_Model = "0xd9d10f63d736dc2d5271ce7e94c4b07e114d7c76";

export const vip141 = () => {
  const meta = {
    version: "v2",
    title: "VIP-141 Risk Parameters Update",
    description: `

  Changes to do
    Venus ANKR (DeFi)
      CF: 0.25 -> 0.2
      SupplyCap: 9,508,802 -> 17,700,000
      BorrowCap: 6,656,161 -> 8,850,000
    Venus BSW (DeFi)
      CF: 0.25 -> 0.2
      SupplyCap: 15,000,000 -> 11,600,000
      BorrowCap: 10,500,000 -> 5,800,000
    Venus ALPACA (DeFi)
      CF: 0.25 -> 0.2
      SupplyCap: 2,500,000 -> 1,500,000
      BorrowCap: 1,750,000 -> 750,000
    Venus USDT (DeFi)
      CF: 0.8 -> 0.75
      LT: 0.88 -> 0.8
      SupplyCap: 18,600,000 -> 1,387,500
      BorrowCap: 14,880,000 -> 925,000
      kink: 0.6 -> 0.8
      base: 0.03 -> 0.02
    Venus USDD (DeFi)
      SupplyCap: 2,000,000 -> 450,000
      BorrowCap: 1,600,000 -> 300,000
      kink: 0.6 -> 0.7
      base: 0.03 -> 0.02
    vFLOKI_GameFi
      CF: 0.25 -> 0.4
      LT: 0.3 -> 0.5
      SupplyCap: 40,000,000,000 -> 22,000,000,000
      BorrowCap: 28,000,000,000 -> 11,000,000,000
    vRACA_GameFi
      CF: 0.25 -> 0.4
      LT: 0.3 -> 0.5
      SupplyCap: 4,000,000,000 -> 4,200,000,000
      BorrowCap: 2,800,000,000 -> 2,100,000,000
    vUSDT_GameFi
      CF: 0.8 -> 0.75
      LT: 0.88 -> 0.8
      SupplyCap: 18,600,000 -> 1,200,000
      BorrowCap: 14,880,000 -> 800,000
      kink: 0.6 -> 0.8
      base: 0.03 -> 0.02
    vUSDD_GameFi
      SupplyCap: 2,000,000 -> 450,000
      BorrowCap: 1,600,000 -> 300,000
      kink: 0.6 -> 0.7
      base: 0.03 -> 0.02
    vankrBNB_LiquidStakedBNB
      CF: 0.35 -> 0.87
      LT: 0.4 -> 0.9
      BorrowCap: 5,600 -> 800
    vBNBx_LiquidStakedBNB
      CF: 0.35 -> 0.87
      LT: 0.4 -> 0.9
      SupplyCap: 1,818 -> 9,600
      BorrowCap: 1,272 -> 960
    vstkBNB_LiquidStakedBNB
      CF: 0.35 -> 0.87
      LT: 0.4 -> 0.9
      SupplyCap: 540 -> 2,900
      BorrowCap: 378 -> 290
    vWBNB_LiquidStakedBNB
      CF: 0.45 -> 0.77
      LT: 0.5 -> 0.8
      SupplyCap: 80,000 -> 24,000
      BorrowCap: 56,000 -> 16,000
      kink: 0.5 -> 0.8
      base: 0.02 -> 0.01
      multiplier: 0.2 -> 0.035
    vHAY_Stablecoins
      CF: 0.65 -> 0.75
      LT: 0.7 -> 0.8
      BorrowCap: 200,000 -> 250,000
      kink: 0.8 -> 0.5
      jumpMultiplier: 3 -> 2.5
      RF: 0.2 -> 0.1
    vUSDT_Stablecoins
      CF: 0.8 -> 0.75
      LT: 0.88 -> 0.8
      SupplyCap: 1,000,000 -> 960,000
      BorrowCap: 400,000 -> 640,000
      kink: 0.6 -> 0.8
      multiplier: 0.05 -> 0.1
    vUSDD_Stablecoins
      CF: 0.65 -> 0.75
      LT: 0.7 -> 0.8
      SupplyCap: 1,000,000 -> 240,000
      BorrowCap: 400,000 -> 160,000
      kink: 0.8 -> 0.7
      jumpMultiplier: 3 -> 2.5
    vBTT_Tron
      CF: 0.25 -> 0.4
      LT: 0.3 -> 0.5
      SupplyCap: 1,500,000,000,000 -> 1,130,000,000,000
      BorrowCap: 1,050,000,000,000 -> 565,000,000,000
    vWIN_Tron
      CF: 0.25 -> 0.4
      LT: 0.3 -> 0.5
      SupplyCap: 3,000,000,000 -> 2,300,000,000
      BorrowCap: 2,100,000,000 -> 1,150,000,000
    vTRX_Tron
      CF: 0.25 -> 0.4
      LT: 0.3 -> 0.5
      SupplyCap: 11,000,000 -> 6,300,000
      BorrowCap: 7,700,000 ->  3,150,000
    vUSDT_Tron
      CF: 0.8 -> 0.75
      LT: 0.88 -> 0.8
      SupplyCap: 18,600,000 -> 1,380,000
      BorrowCap: 14,880,000 -> 920,000
      base: 0.03 -> 0.02
      kink: 0.6 -> 0.8
    vUSDD_Tron
      SupplyCap: 2,000,000 -> 1,950,000
      BorrowCap: 1,600,000 -> 1,300,000
      base: 0.03 -> 0.02
      kink: 0.6 -> 0.7`,

    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      /**
       * DeFi_Pool
       */
      {
        target: DeFi_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vANKR_DeFi, parseUnits("0.2", 18), parseUnits("0.3", 18)],
      },

      {
        target: DeFi_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vBSW_DeFi, parseUnits("0.2", 18), parseUnits("0.3", 18)],
      },

      {
        target: DeFi_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vALPACA_DeFi, parseUnits("0.2", 18), parseUnits("0.3", 18)],
      },

      {
        target: DeFi_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vUSDT_DeFi, parseUnits("0.75", 18), parseUnits("0.8", 18)],
      },

      {
        target: DeFi_Pool,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vANKR_DeFi, vBSW_DeFi, vALPACA_DeFi, vUSDT_DeFi, vUSDD_DeFi],
          [
            parseUnits("17700000", 18),
            parseUnits("11600000", 18),
            parseUnits("1500000", 18),
            parseUnits("1387500", 18),
            parseUnits("450000", 18),
          ],
        ],
      },

      {
        target: DeFi_Pool,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vANKR_DeFi, vBSW_DeFi, vALPACA_DeFi, vUSDT_DeFi, vUSDD_DeFi],
          [
            parseUnits("8850000", 18),
            parseUnits("5800000", 18),
            parseUnits("750000", 18),
            parseUnits("925000", 18),
            parseUnits("300000", 18),
          ],
        ],
      },

      {
        target: vUSDT_DeFi,
        signature: "setInterestRateModel(address)",
        params: [vUSDT_DeFi_Rate_Model],
      },

      {
        target: vUSDD_DeFi,
        signature: "setInterestRateModel(address)",
        params: [vUSDD_DeFi_Rate_Model],
      },

      /**
       * GameFi_Pool
       */

      {
        target: GameFi_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vFLOKI_GameFi, parseUnits("0.4", 18), parseUnits("0.5", 18)],
      },

      {
        target: GameFi_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vRACA_GameFi, parseUnits("0.4", 18), parseUnits("0.5", 18)],
      },

      {
        target: GameFi_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vUSDT_GameFi, parseUnits("0.75", 18), parseUnits("0.8", 18)],
      },

      {
        target: GameFi_Pool,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vFLOKI_GameFi, vRACA_GameFi, vUSDT_GameFi, vUSDD_GameFi],
          [
            parseUnits("22000000000", 9),
            parseUnits("4200000000", 18),
            parseUnits("1200000", 18),
            parseUnits("450000", 18),
          ],
        ],
      },

      {
        target: GameFi_Pool,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vFLOKI_GameFi, vRACA_GameFi, vUSDT_GameFi, vUSDD_GameFi],
          [
            parseUnits("11000000000", 9),
            parseUnits("2100000000", 18),
            parseUnits("800000", 18),
            parseUnits("300000", 18),
          ],
        ],
      },

      {
        target: vUSDD_GameFi,
        signature: "setInterestRateModel(address)",
        params: [vUSDD_GameFi_Rate_Model],
      },

      {
        target: vUSDT_GameFi,
        signature: "setInterestRateModel(address)",
        params: [vUSDT_GameFi_Rate_Model],
      },

      /**
       * LiquidStakedBNB_Pool
       */

      {
        target: LiquidStakedBNB_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vankrBNB_LiquidStakedBNB, parseUnits("0.87", 18), parseUnits("0.9", 18)],
      },

      {
        target: LiquidStakedBNB_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vBNBx_LiquidStakedBNB, parseUnits("0.87", 18), parseUnits("0.9", 18)],
      },

      {
        target: LiquidStakedBNB_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vstkBNB_LiquidStakedBNB, parseUnits("0.87", 18), parseUnits("0.9", 18)],
      },

      {
        target: LiquidStakedBNB_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vWBNB_LiquidStakedBNB, parseUnits("0.77", 18), parseUnits("0.8", 18)],
      },

      {
        target: LiquidStakedBNB_Pool,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vBNBx_LiquidStakedBNB, vstkBNB_LiquidStakedBNB, vWBNB_LiquidStakedBNB],
          [parseUnits("9600", 18), parseUnits("2900", 18), parseUnits("24000", 18)],
        ],
      },

      {
        target: LiquidStakedBNB_Pool,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vankrBNB_LiquidStakedBNB, vBNBx_LiquidStakedBNB, vstkBNB_LiquidStakedBNB, vWBNB_LiquidStakedBNB],
          [parseUnits("800", 18), parseUnits("960", 18), parseUnits("290", 18), parseUnits("16000", 18)],
        ],
      },

      {
        target: vWBNB_LiquidStakedBNB,
        signature: "setInterestRateModel(address)",
        params: [vWBNB_LiquidStakedBNB_Rate_Model],
      },

      /**
       * StableCoin_Pool
       */

      {
        target: StableCoin_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vHAY_Stablecoins, parseUnits("0.75", 18), parseUnits("0.8", 18)],
      },

      {
        target: StableCoin_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vUSDT_Stablecoins, parseUnits("0.75", 18), parseUnits("0.8", 18)],
      },

      {
        target: StableCoin_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vUSDD_Stablecoins, parseUnits("0.75", 18), parseUnits("0.8", 18)],
      },

      {
        target: StableCoin_Pool,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vUSDT_Stablecoins, vUSDD_Stablecoins],
          [parseUnits("960000", 18), parseUnits("240000", 18)],
        ],
      },

      {
        target: StableCoin_Pool,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vHAY_Stablecoins, vUSDT_Stablecoins, vUSDD_Stablecoins],
          [parseUnits("250000", 18), parseUnits("640000", 18), parseUnits("160000", 18)],
        ],
      },

      {
        target: vHAY_Stablecoins,
        signature: "setReserveFactor(uint256)",
        params: [parseUnits("0.1", 18)],
      },

      {
        target: vHAY_Stablecoins,
        signature: "setInterestRateModel(address)",
        params: [vHAY_Stablecoins_Rate_Model],
      },

      {
        target: vUSDT_Stablecoins,
        signature: "setInterestRateModel(address)",
        params: [vUSDT_Stablecoins_Rate_Model],
      },

      {
        target: vUSDD_Stablecoins,
        signature: "setInterestRateModel(address)",
        params: [vUSDD_Stablecoins_Rate_Model],
      },

      /**
       * Tron_Pool
       */

      {
        target: Tron_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vBTT_Tron, parseUnits("0.4", 18), parseUnits("0.5", 18)],
      },

      {
        target: Tron_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vWIN_Tron, parseUnits("0.4", 18), parseUnits("0.5", 18)],
      },

      {
        target: Tron_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vTRX_Tron, parseUnits("0.4", 18), parseUnits("0.5", 18)],
      },

      {
        target: Tron_Pool,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vUSDT_Tron, parseUnits("0.75", 18), parseUnits("0.8", 18)],
      },

      {
        target: Tron_Pool,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vBTT_Tron, vWIN_Tron, vTRX_Tron, vUSDT_Tron, vUSDD_Tron],
          [
            parseUnits("1130000000000", 18),
            parseUnits("2300000000", 18),
            parseUnits("6300000", 6),
            parseUnits("1380000", 18),
            parseUnits("1950000", 18),
          ],
        ],
      },

      {
        target: Tron_Pool,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vBTT_Tron, vWIN_Tron, vTRX_Tron, vUSDT_Tron, vUSDD_Tron],
          [
            parseUnits("565000000000", 18),
            parseUnits("1150000000", 18),
            parseUnits("3150000", 6),
            parseUnits("920000", 18),
            parseUnits("1300000", 18),
          ],
        ],
      },

      {
        target: vUSDT_Tron,
        signature: "setInterestRateModel(address)",
        params: [vUSDT_Tron_Rate_Model],
      },

      {
        target: vUSDD_Tron,
        signature: "setInterestRateModel(address)",
        params: [vUSDD_Tron_Rate_Model],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
