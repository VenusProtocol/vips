import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip465, {
  UNICHAIN_CORE_COMPTROLLER,
  UNICHAIN_vUSDC_CORE,
  UNICHAIN_vUSDC_CORE_BORROW_CAP,
  UNICHAIN_vUSDC_CORE_SUPPLY_CAP,
} from "../../vips/vip-465/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(10933119, async () => {
  const provider = ethers.provider;

  const comptrollerCore = new ethers.Contract(UNICHAIN_CORE_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("correct supply cap for usdc market", async () => {
      expect(await comptrollerCore.supplyCaps(UNICHAIN_vUSDC_CORE)).to.equal(parseUnits("3000000", 6));
    });

    it("correct borrow cap for usdc market", async () => {
      expect(await comptrollerCore.borrowCaps(UNICHAIN_vUSDC_CORE)).to.equal(parseUnits("1500000", 6));
    });
  });

  testForkedNetworkVipCommands("vip465", await vip465());

  describe("Post-VIP behaviour", async () => {
    it("correct supply cap for usdc market", async () => {
      expect(await comptrollerCore.supplyCaps(UNICHAIN_vUSDC_CORE)).to.equal(UNICHAIN_vUSDC_CORE_SUPPLY_CAP);
    });

    it("correct borrow cap for usdc market", async () => {
      expect(await comptrollerCore.borrowCaps(UNICHAIN_vUSDC_CORE)).to.equal(UNICHAIN_vUSDC_CORE_BORROW_CAP);
    });
  });
});
