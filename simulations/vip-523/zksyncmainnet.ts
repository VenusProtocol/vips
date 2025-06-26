import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip523, { COMPTROLLER, vwUSDM, wUSDM, wUSDMMLiquidator } from "../../vips/vip-523/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;

forking(62088882, async () => {
  const provider = ethers.provider;

  const wusdm = new ethers.Contract(wUSDM, ERC20_ABI, provider);
  const vwusdm = new ethers.Contract(vwUSDM, VTOKEN_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check wUSDM balance of the treasury", async () => {
      const treasury = new ethers.Contract(zksyncmainnet.VTREASURY, VTOKEN_ABI, provider);
      const balance = await wusdm.balanceOf(treasury.address);
      expect(balance).to.equal(parseUnits("147630.611484558254033547", 18));
    });

    it("check wUSDM balance of normal timelock", async () => {
      const normalTimelock = new ethers.Contract(zksyncmainnet.NORMAL_TIMELOCK, VTOKEN_ABI, provider);
      const balance = await wusdm.balanceOf(normalTimelock.address);
      expect(balance).to.equal(0);
    });

    it("check vwUSDM balance of liquidator", async () => {
      const balance = await vwusdm.balanceOf(wUSDMMLiquidator);
      expect(balance).to.equal(parseUnits("729823.27973", 8));
    });

    it("check if mint is paused", async () => {
      const actionPaused = await comptroller.actionPaused(vwUSDM, 0);
      expect(actionPaused).to.equal(true);
    });

    it("check wUSDM balance of vwUSDM", async () => {
      const balance = await wusdm.balanceOf(vwUSDM);
      expect(balance).to.equal(parseUnits("318.759041639401694935", 18));

      const reserves = await vwusdm.totalReserves();
      expect(reserves).to.equal(parseUnits("145.204271375432918131", 18));
    });
  });

  testForkedNetworkVipCommands("vip523", await vip523());

  describe("Post-VIP behaviour", async () => {
    it("check wUSDM balance of the treasury", async () => {
      const treasury = new ethers.Contract(zksyncmainnet.VTREASURY, VTOKEN_ABI, provider);
      const balance = await wusdm.balanceOf(treasury.address);
      expect(balance).to.equal(parseUnits("0.611484558254033547", 18));
    });

    it("check wUSDM balance of normal timelock", async () => {
      const normalTimelock = new ethers.Contract(zksyncmainnet.NORMAL_TIMELOCK, VTOKEN_ABI, provider);
      const balance = await wusdm.balanceOf(normalTimelock.address);
      expect(balance).to.equal(parseUnits("0", 18));
    });

    it("check vwUSDM balance of normal timelock", async () => {
      const normalTimelock = new ethers.Contract(zksyncmainnet.NORMAL_TIMELOCK, VTOKEN_ABI, provider);
      const balance = await vwusdm.balanceOf(normalTimelock.address);
      expect(balance).to.equal(parseUnits("0", 18));
    });

    it("check vwUSDM balance of liquidator", async () => {
      const balance = await vwusdm.balanceOf(wUSDMMLiquidator);
      expect(balance).to.equal(parseUnits("876857.52919656", 8));
    });

    it("check if mint is paused", async () => {
      const actionPaused = await comptroller.actionPaused(vwUSDM, 0);
      expect(actionPaused).to.equal(true);
    });

    it("check wUSDM balance of vwUSDM", async () => {
      const balance = await wusdm.balanceOf(vwUSDM);
      expect(balance).to.equal(parseUnits("147948.759041639401694935", 18));

      const reserves = await vwusdm.totalReserves();
      expect(reserves).to.equal(parseUnits("18116.308274305550828548", 18));
    });
  });
});
