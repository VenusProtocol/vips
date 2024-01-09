import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const Comptroller = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const vETH_INTEREST_MODEL = "0xDA8ED13b2e88Ec292c9E8Ba8252E7a160429Ff7B";
const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
const NewCollateralFactor = parseUnits("0.78", 18);

const LiquidStakedBNB_Pool = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
const vankrBNB_LiquidStakedBNB = "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f";
const vBNBx_LiquidStakedBNB = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
const vstkBNB_LiquidStakedBNB = "0xcc5D9e502574cda17215E70bC0B4546663785227";
const vSnBNB_LiquidStakedBNB = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
const vWBNB_LiquidStakedBNB = "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2";

const StableCoin_Pool = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
const vHAY_Stablecoins = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";
const vUSDD_Stablecoins = "0xc3a45ad8812189cAb659aD99E64B1376f6aCD035";
const vUSDT_Stablecoins = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
const vagEUR_Stablecoins = "0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F";

export const vip234 = () => {
  const meta = {
    version: "v2",
    title: "VIP-234 Update Risk Parameters",
    description: `
        VIP
        Risk parameters suggested by Chaos lab:
        - Update Multiplier to 9% and Kink to 75% for ETH
        - Increase CF of BNB to 78%
        - Update Supply caps of:
          - FDUSD to 1,00,00,000
          - WBNB(LiquidStakedBNB_Pool) to 2,500
          - SnBNB(LiquidStakedBNB_Pool) to 500
          - BNBx(LiquidStakedBNB_Pool) to 350
          - ankrBNB(LiquidStakedBNB_Pool) to 1,200
          - stkBNB(LiquidStakedBNB_Pool) to 600
          - USDT(StableCoin_Pool) to 1,50,000
          - USDD(StableCoin_Pool) to 45,000
          - HAY(StableCoin_Pool) to 5,00,000
          - agEUR(StableCoin_Pool) to 2,50,000
        -Update Borrow caps of :
          - FDUSD to 80,00,000
          - WBNB(LiquidStakedBNB_Pool) to 200
          - SnBNB(LiquidStakedBNB_Pool) to 10
          - BNBx(LiquidStakedBNB_Pool) to 10
          - ankrBNB(LiquidStakedBNB_Pool) to 10
          - stkBNB(LiquidStakedBNB_Pool) to 10
          - USDT(StableCoin_Pool) to 1,00,000
          - USDD(StableCoin_Pool) to 30,000
          - HAY(StableCoin_Pool) to 30,000
          - agEUR(StableCoin_Pool) to 30,000

       `,
    forDescription: "I agree that Venus Protocol should proceed with these parameter updation suggested by chaos lab",
    againstDescription:
      "I do not think that Venus Protocol should proceed with these parameter updation suggested by chaos lab",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with these parameter updation suggested by chaos lab or not",
  };
  return makeProposal(
    [
      {
        target: Comptroller,
        signature: "_setCollateralFactor(address,uint256)",
        params: [vBNB, NewCollateralFactor],
      },
      {
        target: vETH,
        signature: "_setInterestRateModel(address)",
        params: [vETH_INTEREST_MODEL],
      },
      {
        target: Comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vFDUSD], [parseUnits("10000000", 18)]],
      },
      {
        target: Comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vFDUSD], [parseUnits("8000000", 18)]],
      },
      {
        target: LiquidStakedBNB_Pool,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [
            vankrBNB_LiquidStakedBNB,
            vBNBx_LiquidStakedBNB,
            vstkBNB_LiquidStakedBNB,
            vSnBNB_LiquidStakedBNB,
            vWBNB_LiquidStakedBNB,
          ],
          [
            parseUnits("1200", 18),
            parseUnits("350", 18),
            parseUnits("600", 18),
            parseUnits("500", 18),
            parseUnits("2500", 18),
          ],
        ],
      },
      {
        target: LiquidStakedBNB_Pool,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [
            vankrBNB_LiquidStakedBNB,
            vBNBx_LiquidStakedBNB,
            vstkBNB_LiquidStakedBNB,
            vSnBNB_LiquidStakedBNB,
            vWBNB_LiquidStakedBNB,
          ],
          [
            parseUnits("10", 18),
            parseUnits("10", 18),
            parseUnits("10", 18),
            parseUnits("10", 18),
            parseUnits("200", 18),
          ],
        ],
      },

      {
        target: StableCoin_Pool,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vHAY_Stablecoins, vUSDT_Stablecoins, vUSDD_Stablecoins, vagEUR_Stablecoins],
          [parseUnits("45000", 18), parseUnits("150000", 18), parseUnits("45000", 18), parseUnits("45000", 18)],
        ],
      },
      {
        target: StableCoin_Pool,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vHAY_Stablecoins, vUSDT_Stablecoins, vUSDD_Stablecoins, vagEUR_Stablecoins],
          [parseUnits("30000", 18), parseUnits("100000", 18), parseUnits("30000", 18), parseUnits("30000", 18)],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
