import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip500, {
  ETH_CORE_COMPTROLLER,
  ETH_WEETHS_CORE,
  ETH_WEETHS_CORE_SUPPLY_CAP,
} from "../../vips/vip-500/bscmainnet";
import COMPTROLLER_ABI from "./abi/ilComptroller.json";

forking(22117930, async () => {
  const provider = ethers.provider;

  const comptrollerCore = new ethers.Contract(ETH_CORE_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("correct supply cap for weETHs", async () => {
      expect(await comptrollerCore.supplyCaps(ETH_WEETHS_CORE)).to.equal(parseUnits("1400", 18));
    });
  });

  testForkedNetworkVipCommands("vip500", await vip500());

  describe("Post-VIP behaviour", async () => {
    it("correct supply cap for weETHs", async () => {
      expect(await comptrollerCore.supplyCaps(ETH_WEETHS_CORE)).to.equal(ETH_WEETHS_CORE_SUPPLY_CAP);
    });
  });
});
