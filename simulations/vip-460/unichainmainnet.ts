import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip460, {
  UNICHAIN_CORE_COMPTROLLER,
  UNICHAIN_vUSDC_CORE,
  UNICHAIN_vUSDC_CORE_SUPPLY_CAP,
  UNICHAIN_vWETH_CORE,
  UNICHAIN_vWETH_CORE_SUPPLY_CAP,
} from "../../vips/vip-460/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(10424905, async () => {
  const provider = ethers.provider;

  const comptrollerCore = new ethers.Contract(UNICHAIN_CORE_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("correct supply cap for usdc and weth market", async () => {
      expect(await comptrollerCore.supplyCaps(UNICHAIN_vUSDC_CORE)).to.equal(parseUnits("1000000", 6));
      expect(await comptrollerCore.supplyCaps(UNICHAIN_vWETH_CORE)).to.equal(parseUnits("700", 18));
    });
  });

  testForkedNetworkVipCommands("vip460", await vip460());

  describe("Post-VIP behaviour", async () => {
    it("correct supply cap for usdc and weth market", async () => {
      expect(await comptrollerCore.supplyCaps(UNICHAIN_vUSDC_CORE)).to.equal(UNICHAIN_vUSDC_CORE_SUPPLY_CAP);
      expect(await comptrollerCore.supplyCaps(UNICHAIN_vWETH_CORE)).to.equal(UNICHAIN_vWETH_CORE_SUPPLY_CAP);
    });
  });
});
