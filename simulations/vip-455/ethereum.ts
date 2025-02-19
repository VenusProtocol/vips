import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip455, {
  ETHEREUM_CORE_COMPTROLLER,
  ETHEREUM_LST_COMPTROLLER,
  ETHEREUM_vBAL_CORE,
  ETHEREUM_vBAL_CORE_SUPPLY_CAP,
  ETHEREUM_vpufETH_LST,
  ETHEREUM_vpufETH_LST_BORROW_CAP,
} from "../../vips/vip-455/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(21879503, async () => {
  const provider = ethers.provider;

  const comptrollerCore = new ethers.Contract(ETHEREUM_CORE_COMPTROLLER, COMPTROLLER_ABI, provider);
  const comptrollerLST = new ethers.Contract(ETHEREUM_LST_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("correct supply cap for vBAL", async () => {
      expect(await comptrollerCore.supplyCaps(ETHEREUM_vBAL_CORE)).to.equal(parseUnits("2000000", 18));
    });

    it("correct supply cap for vpufETH", async () => {
      expect(await comptrollerLST.borrowCaps(ETHEREUM_vpufETH_LST)).to.equal(parseUnits("300", 18));
    });
  });

  testForkedNetworkVipCommands("vip455", await vip455());

  describe("Post-VIP behaviour", async () => {
    it("correct supply cap for vBAL", async () => {
      expect(await comptrollerCore.supplyCaps(ETHEREUM_vBAL_CORE)).to.equal(ETHEREUM_vBAL_CORE_SUPPLY_CAP);
    });

    it("correct supply cap for vpufETH", async () => {
      expect(await comptrollerLST.borrowCaps(ETHEREUM_vpufETH_LST)).to.equal(ETHEREUM_vpufETH_LST_BORROW_CAP);
    });
  });
});
