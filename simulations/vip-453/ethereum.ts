import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip453, {
  ETHEREUM_CORE_COMPTROLLER,
  ETHEREUM_vweETHs_CORE,
  WEETHS_SUPPLY_CAP,
} from "../../vips/vip-453/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(21867519, async () => {
  const provider = ethers.provider;

  const comptroller = new ethers.Contract(ETHEREUM_CORE_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Post-VIP behaviour", async () => {
    it("correct supply cap for vweETHs", async () => {
      expect(await comptroller.supplyCaps(ETHEREUM_vweETHs_CORE)).to.equal(parseUnits("700", 18));
    });
  });

  testForkedNetworkVipCommands("vip453", await vip453());

  describe("Post-VIP behaviour", async () => {
    it("correct supply cap for vweETHs", async () => {
      expect(await comptroller.supplyCaps(ETHEREUM_vweETHs_CORE)).to.equal(WEETHS_SUPPLY_CAP);
    });
  });
});
