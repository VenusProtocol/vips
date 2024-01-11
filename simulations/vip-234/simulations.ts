import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip234 } from "../../vips/vip-234";
import IL_COMPTROLLER_ABI from "./abi/ILComptroller.json";

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
  let LiquidStakedBNB_Pool_Comptroller: Contract;
  let StableCoin_Pool_Comptroller: Contract;
  const provider = ethers.provider;

  before(async () => {
    LiquidStakedBNB_Pool_Comptroller = new ethers.Contract(LiquidStakedBNB_Pool, IL_COMPTROLLER_ABI, provider);
    StableCoin_Pool_Comptroller = new ethers.Contract(StableCoin_Pool, IL_COMPTROLLER_ABI, provider);
  });
  describe("Pre-VIP behaviour", async () => {
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
      await expectEvents(txResponse, [IL_COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap", "Failure"], [9, 9, 0]);
    },
  });
  describe("Post-VIP behavior", async () => {
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
  });
});
