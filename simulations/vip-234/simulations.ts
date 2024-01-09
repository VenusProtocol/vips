import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { checkInterestRate } from "../../src/vip-framework/checks/interestRateModel";
import { vip234 } from "../../vips/vip-234";
import COMPTROLLER_ABI from "./abi/ComptrollerAbi.json";
import IL_COMPTROLLER_ABI from "./abi/ILComptroller.json";
import VTOKEN_ABI from "./abi/VTokenAbi.json";

const Comptroller = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const BNB = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const OldvETHInterestModel = "0x16412DBB7B2a4E119eDFCb3b58B08d196eC733BE";
const vETHInterestModel = "0xDA8ED13b2e88Ec292c9E8Ba8252E7a160429Ff7B";
const ChainlinkOracle = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
const OracleAdmin = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
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

forking(35091610, () => {
  let comptroller: Contract;
  let LiquidStakedBNB_Pool_Comptroller: Contract;
  let StableCoin_Pool_Comptroller: Contract;
  let vEth: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(Comptroller, COMPTROLLER_ABI, provider);
    LiquidStakedBNB_Pool_Comptroller = new ethers.Contract(LiquidStakedBNB_Pool, IL_COMPTROLLER_ABI, provider);
    StableCoin_Pool_Comptroller = new ethers.Contract(StableCoin_Pool, IL_COMPTROLLER_ABI, provider);
    vEth = new ethers.Contract(vETH, VTOKEN_ABI, provider);
    await setMaxStalePeriodInChainlinkOracle(ChainlinkOracle, BNB, ethers.constants.AddressZero, OracleAdmin);
  });
  describe("Pre-VIP behaviour", async () => {
    it("collateral factor should be 75%", async () => {
      const market = await comptroller.markets(vBNB);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.75", 18));
    });
    it("old interest rate model", async () => {
      expect(await vEth.interestRateModel()).to.equals(OldvETHInterestModel);
    });
    it("supply cap should be 5,500,000 FDUSD", async () => {
      const oldCap = await comptroller.supplyCaps(vFDUSD);
      expect(oldCap).to.equal(parseUnits("5500000", 18));
    });

    it("supply cap should be 4,400,000 FDUSD", async () => {
      const oldCap = await comptroller.borrowCaps(vFDUSD);
      expect(oldCap).to.equal(parseUnits("4400000", 18));
    });

    it("supply cap should be 8,000 ankrBNB market of LiquidStake_Pool", async () => {
      const oldCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(vankrBNB_LiquidStakedBNB);
      expect(oldCap).to.equal(parseUnits("8000", 18));
    });
    it("supply cap should be 9,600 BNBx market of LiquidStake_Pool", async () => {
      const oldCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(vBNBx_LiquidStakedBNB);
      expect(oldCap).to.equal(parseUnits("9600", 18));
    });
    it("supply cap should be 2,900 stkBNB market of LiquidStake_Pool", async () => {
      const oldCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(vstkBNB_LiquidStakedBNB);
      expect(oldCap).to.equal(parseUnits("2900", 18));
    });
    it("supply cap should be 3,000 SnBNB market of LiquidStake_Pool", async () => {
      const oldCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(vSnBNB_LiquidStakedBNB);
      expect(oldCap).to.equal(parseUnits("3000", 18));
    });
    it("supply cap should be 24,000 WBNB market of LiquidStake_Pool", async () => {
      const oldCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(vWBNB_LiquidStakedBNB);
      expect(oldCap).to.equal(parseUnits("24000", 18));
    });

    it("supply cap should be 500,000 HAY market of StableCoin_Pool", async () => {
      const oldCap = await StableCoin_Pool_Comptroller.supplyCaps(vHAY_Stablecoins);
      expect(oldCap).to.equal(parseUnits("500000", 18));
    });
    it("supply cap should be 960,000 USDT market of StableCoin_Pool", async () => {
      const oldCap = await StableCoin_Pool_Comptroller.supplyCaps(vUSDT_Stablecoins);
      expect(oldCap).to.equal(parseUnits("960000", 18));
    });
    it("supply cap should be 240,000 USDD market of StableCoin_Pool", async () => {
      const oldCap = await StableCoin_Pool_Comptroller.supplyCaps(vUSDD_Stablecoins);
      expect(oldCap).to.equal(parseUnits("240000", 18));
    });
    it("supply cap should be 250,000 agEUR market of StableCoin_Pool", async () => {
      const oldCap = await StableCoin_Pool_Comptroller.supplyCaps(vagEUR_Stablecoins);
      expect(oldCap).to.equal(parseUnits("250000", 18));
    });

    it("borrow cap should be 1,600 ankrBNB market of LiquidStake_Pool", async () => {
      const oldCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(vankrBNB_LiquidStakedBNB);
      expect(oldCap).to.equal(parseUnits("1600", 18));
    });
    it("borrow cap should be 1,920 BNBx market of LiquidStake_Pool", async () => {
      const oldCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(vBNBx_LiquidStakedBNB);
      expect(oldCap).to.equal(parseUnits("1920", 18));
    });
    it("borrow cap should be 580 stkBNB market of LiquidStake_Pool", async () => {
      const oldCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(vstkBNB_LiquidStakedBNB);
      expect(oldCap).to.equal(parseUnits("580", 18));
    });
    it("borrow cap should be 800 SnBNB market of LiquidStake_Pool", async () => {
      const oldCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(vSnBNB_LiquidStakedBNB);
      expect(oldCap).to.equal(parseUnits("800", 18));
    });
    it("borrow cap should be 16,000 WBNB market of LiquidStake_Pool", async () => {
      const oldCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(vWBNB_LiquidStakedBNB);
      expect(oldCap).to.equal(parseUnits("16000", 18));
    });

    it("borrow cap should be 250,000 HAY market of StableCoin_Pool", async () => {
      const oldCap = await StableCoin_Pool_Comptroller.borrowCaps(vHAY_Stablecoins);
      expect(oldCap).to.equal(parseUnits("250000", 18));
    });
    it("borrow cap should be 640,000 USDT market of StableCoin_Pool", async () => {
      const oldCap = await StableCoin_Pool_Comptroller.borrowCaps(vUSDT_Stablecoins);
      expect(oldCap).to.equal(parseUnits("640000", 18));
    });
    it("borrow cap should be 160,000 USDD market of StableCoin_Pool", async () => {
      const oldCap = await StableCoin_Pool_Comptroller.borrowCaps(vUSDD_Stablecoins);
      expect(oldCap).to.equal(parseUnits("160000", 18));
    });
    it("borrow cap should be 200,000 agEUR market of StableCoin_Pool", async () => {
      const oldCap = await StableCoin_Pool_Comptroller.borrowCaps(vagEUR_Stablecoins);
      expect(oldCap).to.equal(parseUnits("200000", 18));
    });
  });

  testVip("VIP-234 Update Risk Parameters", vip234(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI],
        ["NewCollateralFactor", "NewMarketInterestRateModel", "NewSupplyCap", "NewBorrowCap", "Failure"],
        [1, 1, 10, 10, 0],
      );
    },
  });
  describe("Post-VIP behavior", async () => {
    it("set collateral factor to 78%", async () => {
      const market = await comptroller.markets(vBNB);
      expect(market.collateralFactorMantissa).to.equal(NewCollateralFactor);
    });
    it("sets new interest rate model", async () => {
      expect(await vEth.interestRateModel()).to.equals(vETHInterestModel);
    });
    it("sets the supply cap to 100,00,000 FDUSD", async () => {
      const newCap = await comptroller.supplyCaps(vFDUSD);
      expect(newCap).to.equal(parseUnits("10000000", 18));
    });

    it("sets the supply cap to 8,000,000 FDUSD", async () => {
      const newCap = await comptroller.borrowCaps(vFDUSD);
      expect(newCap).to.equal(parseUnits("8000000", 18));
    });

    it("sets the supply cap to 1,200 ankrBNB market of LiquidStake_Pool", async () => {
      const newCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(vankrBNB_LiquidStakedBNB);
      expect(newCap).to.equal(parseUnits("1200", 18));
    });
    it("sets the supply cap to 350 BNBx market of LiquidStake_Pool", async () => {
      const newCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(vBNBx_LiquidStakedBNB);
      expect(newCap).to.equal(parseUnits("350", 18));
    });
    it("sets the supply cap to 600 stkBNB market of LiquidStake_Pool", async () => {
      const newCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(vstkBNB_LiquidStakedBNB);
      expect(newCap).to.equal(parseUnits("600", 18));
    });
    it("sets the supply cap to 500 SnBNB market of LiquidStake_Pool", async () => {
      const newCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(vSnBNB_LiquidStakedBNB);
      expect(newCap).to.equal(parseUnits("500", 18));
    });
    it("sets the supply cap to 2500 WBNB market of LiquidStake_Pool", async () => {
      const newCap = await LiquidStakedBNB_Pool_Comptroller.supplyCaps(vWBNB_LiquidStakedBNB);
      expect(newCap).to.equal(parseUnits("2500", 18));
    });

    it("sets the supply cap to 45,000 HAY market of StableCoin_Pool", async () => {
      const newCap = await StableCoin_Pool_Comptroller.supplyCaps(vHAY_Stablecoins);
      expect(newCap).to.equal(parseUnits("45000", 18));
    });
    it("sets the supply cap to 150,000 USDT market of StableCoin_Pool", async () => {
      const newCap = await StableCoin_Pool_Comptroller.supplyCaps(vUSDT_Stablecoins);
      expect(newCap).to.equal(parseUnits("150000", 18));
    });
    it("sets the supply cap to 45,000 USDD market of StableCoin_Pool", async () => {
      const newCap = await StableCoin_Pool_Comptroller.supplyCaps(vUSDD_Stablecoins);
      expect(newCap).to.equal(parseUnits("45000", 18));
    });
    it("sets the supply cap to 45,000 agEUR market of StableCoin_Pool", async () => {
      const newCap = await StableCoin_Pool_Comptroller.supplyCaps(vagEUR_Stablecoins);
      expect(newCap).to.equal(parseUnits("45000", 18));
    });

    it("sets the borrow cap to 10 ankrBNB market of LiquidStake_Pool", async () => {
      const newCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(vankrBNB_LiquidStakedBNB);
      expect(newCap).to.equal(parseUnits("10", 18));
    });
    it("sets the borrow cap to 10 BNBx market of LiquidStake_Pool", async () => {
      const newCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(vBNBx_LiquidStakedBNB);
      expect(newCap).to.equal(parseUnits("10", 18));
    });
    it("sets the borrow cap to 10 stkBNB market of LiquidStake_Pool", async () => {
      const newCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(vstkBNB_LiquidStakedBNB);
      expect(newCap).to.equal(parseUnits("10", 18));
    });
    it("sets the borrow cap to 10 SnBNB market of LiquidStake_Pool", async () => {
      const newCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(vSnBNB_LiquidStakedBNB);
      expect(newCap).to.equal(parseUnits("10", 18));
    });
    it("sets the borrow cap to 200 WBNB market of LiquidStake_Pool", async () => {
      const newCap = await LiquidStakedBNB_Pool_Comptroller.borrowCaps(vWBNB_LiquidStakedBNB);
      expect(newCap).to.equal(parseUnits("200", 18));
    });

    it("sets the borrow cap to 30,000 HAY market of StableCoin_Pool", async () => {
      const newCap = await StableCoin_Pool_Comptroller.borrowCaps(vHAY_Stablecoins);
      expect(newCap).to.equal(parseUnits("30000", 18));
    });
    it("sets the borrow cap to 100,000 USDT market of StableCoin_Pool", async () => {
      const newCap = await StableCoin_Pool_Comptroller.borrowCaps(vUSDT_Stablecoins);
      expect(newCap).to.equal(parseUnits("100000", 18));
    });
    it("sets the borrow cap to 30,000 USDD market of StableCoin_Pool", async () => {
      const newCap = await StableCoin_Pool_Comptroller.borrowCaps(vUSDD_Stablecoins);
      expect(newCap).to.equal(parseUnits("30000", 18));
    });
    it("sets the borrow cap to 30,000 agEUR market of StableCoin_Pool", async () => {
      const newCap = await StableCoin_Pool_Comptroller.borrowCaps(vagEUR_Stablecoins);
      expect(newCap).to.equal(parseUnits("30000", 18));
    });
    checkInterestRate(vETHInterestModel, "ETH", {
      base: "0",
      multiplier: ".09",
      jump: "2",
      kink: "0.75",
    });
  });
});
