import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip449, {
  ZKSYNC_CORE_COMPTROLLER,
  ZKSYNC_vUSDC_CORE,
  ZKSYNC_vUSDC_CORE_SUPPLY_CAP,
} from "../../vips/vip-449/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(55778674, async () => {
  const provider = ethers.provider;

  const comptroller = new ethers.Contract(ZKSYNC_CORE_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Post-VIP behaviour", async () => {
    it("correct supply cap for vUSDC", async () => {
      expect(await comptroller.supplyCaps(ZKSYNC_vUSDC_CORE)).to.equal(parseUnits("30000000", 6));
    });
  });

  testForkedNetworkVipCommands("vip449", await vip449());

  describe("Post-VIP behaviour", async () => {
    it("correct supply cap for vUSDC", async () => {
      expect(await comptroller.supplyCaps(ZKSYNC_vUSDC_CORE)).to.equal(ZKSYNC_vUSDC_CORE_SUPPLY_CAP);
    });
  });
});
