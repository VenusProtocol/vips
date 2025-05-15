import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip488, {
  UNICHAIN_CORE_COMPTROLLER,
  UNICHAIN_vUSDC_CORE,
  UNICHAIN_vUSDC_CORE_BORROW_CAP,
  UNICHAIN_vUSDC_CORE_SUPPLY_CAP,
  UNICHAIN_vWETH_CORE,
  UNICHAIN_vWETH_CORE_BORROW_CAP,
  UNICHAIN_vWETH_CORE_SUPPLY_CAP,
} from "../../vips/vip-488/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(14843220, async () => {
  const provider = ethers.provider;

  const comptrollerCore = new ethers.Contract(UNICHAIN_CORE_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("correct supply cap for USDC market", async () => {
      expect(await comptrollerCore.supplyCaps(UNICHAIN_vUSDC_CORE)).to.equal(parseUnits("4300000", 6));
    });

    it("correct supply cap for WETH market", async () => {
      expect(await comptrollerCore.supplyCaps(UNICHAIN_vWETH_CORE)).to.equal(parseUnits("1500", 18));
    });

    it("correct borrow cap for USDC market", async () => {
      expect(await comptrollerCore.borrowCaps(UNICHAIN_vUSDC_CORE)).to.equal(parseUnits("3000000", 6));
    });

    it("correct borrow cap for WETH market", async () => {
      expect(await comptrollerCore.borrowCaps(UNICHAIN_vWETH_CORE)).to.equal(parseUnits("1000", 18));
    });
  });

  testForkedNetworkVipCommands("vip488", await vip488());

  describe("Post-VIP behaviour", async () => {
    it("correct supply cap for USDC market", async () => {
      expect(await comptrollerCore.supplyCaps(UNICHAIN_vUSDC_CORE)).to.equal(UNICHAIN_vUSDC_CORE_SUPPLY_CAP);
    });

    it("correct supply cap for WETH market", async () => {
      expect(await comptrollerCore.supplyCaps(UNICHAIN_vWETH_CORE)).to.equal(UNICHAIN_vWETH_CORE_SUPPLY_CAP);
    });

    it("correct borrow cap for USDC market", async () => {
      expect(await comptrollerCore.borrowCaps(UNICHAIN_vUSDC_CORE)).to.equal(UNICHAIN_vUSDC_CORE_BORROW_CAP);
    });

    it("correct borrow cap for WETH market", async () => {
      expect(await comptrollerCore.borrowCaps(UNICHAIN_vWETH_CORE)).to.equal(UNICHAIN_vWETH_CORE_BORROW_CAP);
    });
  });
});
