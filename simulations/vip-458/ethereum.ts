import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip458, {
  ETHEREUM_CORE_COMPTROLLER,
  ETHEREUM_vBAL_CORE,
  ETHEREUM_vBAL_CORE_SUPPLY_CAP,
} from "../../vips/vip-458/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(21930481, async () => {
  const provider = ethers.provider;

  const comptrollerCore = new ethers.Contract(ETHEREUM_CORE_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("correct supply cap for vBAL", async () => {
      expect(await comptrollerCore.supplyCaps(ETHEREUM_vBAL_CORE)).to.equal(parseUnits("3000000", 18));
    });
  });

  testForkedNetworkVipCommands("vip458", await vip458());

  describe("Post-VIP behaviour", async () => {
    it("correct supply cap for vBAL", async () => {
      expect(await comptrollerCore.supplyCaps(ETHEREUM_vBAL_CORE)).to.equal(ETHEREUM_vBAL_CORE_SUPPLY_CAP);
    });
  });
});
