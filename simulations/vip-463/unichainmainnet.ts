import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip463, {
  UNICHAIN_CORE_COMPTROLLER,
  UNICHAIN_vUSDC_CORE,
  UNICHAIN_vUSDC_CORE_BORROW_CAP,
  UNICHAIN_vUSDC_CORE_SUPPLY_CAP,
  UNICHAIN_vWETH_CORE,
  UNICHAIN_vWETH_CORE_BORROW_CAP,
  UNICHAIN_vWETH_CORE_SUPPLY_CAP,
} from "../../vips/vip-463/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(10605355, async () => {
  const provider = ethers.provider;

  const comptrollerCore = new ethers.Contract(UNICHAIN_CORE_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("correct supply cap for usdc and weth market", async () => {
      expect(await comptrollerCore.supplyCaps(UNICHAIN_vUSDC_CORE)).to.equal(parseUnits("1500000", 6));
      expect(await comptrollerCore.supplyCaps(UNICHAIN_vWETH_CORE)).to.equal(parseUnits("1000", 18));
    });

    it("correct borrow cap for usdc and weth market", async () => {
      expect(await comptrollerCore.borrowCaps(UNICHAIN_vUSDC_CORE)).to.equal(parseUnits("850000", 6));
      expect(await comptrollerCore.borrowCaps(UNICHAIN_vWETH_CORE)).to.equal(parseUnits("300", 18));
    });
  });

  testForkedNetworkVipCommands("vip463", await vip463());

  describe("Post-VIP behaviour", async () => {
    it("correct supply cap for usdc and weth market", async () => {
      expect(await comptrollerCore.supplyCaps(UNICHAIN_vUSDC_CORE)).to.equal(UNICHAIN_vUSDC_CORE_SUPPLY_CAP);
      expect(await comptrollerCore.supplyCaps(UNICHAIN_vWETH_CORE)).to.equal(UNICHAIN_vWETH_CORE_SUPPLY_CAP);
    });

    it("correct borrow cap for usdc and weth market", async () => {
      expect(await comptrollerCore.borrowCaps(UNICHAIN_vUSDC_CORE)).to.equal(UNICHAIN_vUSDC_CORE_BORROW_CAP);
      expect(await comptrollerCore.borrowCaps(UNICHAIN_vWETH_CORE)).to.equal(UNICHAIN_vWETH_CORE_BORROW_CAP);
    });
  });
});
