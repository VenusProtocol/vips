import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip449, {
  ETHEREUM_CORE_COMPTROLLER,
  ETHEREUM_vBAL_CORE,
  ETHEREUM_vBAL_CORE_SUPPLY_CAP,
} from "../../vips/vip-449/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(21828630, async () => {
  const provider = ethers.provider;

  const comptroller = new ethers.Contract(ETHEREUM_CORE_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Post-VIP behaviour", async () => {
    it("correct supply cap for vBAL", async () => {
      expect(await comptroller.supplyCaps(ETHEREUM_vBAL_CORE)).to.equal(parseUnits("1500000", 18));
    });
  });

  testForkedNetworkVipCommands("vip449", await vip449());

  describe("Post-VIP behaviour", async () => {
    it("correct supply cap for vBAL", async () => {
      expect(await comptroller.supplyCaps(ETHEREUM_vBAL_CORE)).to.equal(ETHEREUM_vBAL_CORE_SUPPLY_CAP);
    });
  });
});
