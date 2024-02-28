import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  CERTIK_RECEIVER,
  COMMUNITY_RECEIVER,
  QUANTSTAMP_RECEIVER,
  TREASURY,
  USDC,
  USDT,
  XVS,
  XVS_RECEIVER,
  vip263,
} from "../../vips/vip-263/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import REWARD_FACET_ABI from "./abi/RewardFacet.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

forking(36524619, () => {
  let usdc: ethers.Contract;
  let usdt: ethers.Contract;
  let xvs: ethers.Contract;
  let prevUSDTBalanceOfCertik: BigNumber;
  let prevUSDCBalanceOfQuantstamp: BigNumber;
  let prevBNBBalanceOfTreasury: BigNumber;
  let prevUSDTBalanceOfCommunity: BigNumber;
  let prevXVSBalanceOfXVSReceiver: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, IERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    xvs = new ethers.Contract(XVS, IERC20_ABI, ethers.provider);

    prevUSDTBalanceOfCertik = await usdt.balanceOf(CERTIK_RECEIVER);
    prevUSDCBalanceOfQuantstamp = await usdc.balanceOf(QUANTSTAMP_RECEIVER);
    prevBNBBalanceOfTreasury = await ethers.provider.getBalance(TREASURY);
    prevUSDTBalanceOfCommunity = await usdt.balanceOf(COMMUNITY_RECEIVER);
    prevXVSBalanceOfXVSReceiver = await xvs.balanceOf(XVS_RECEIVER);
  });

  testVip("VIP-263", vip263(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [3]);
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBNB"], [1]);
      await expectEvents(txResponse, [REWARD_FACET_ABI], ["VenusGranted"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balances of wallets", async () => {
      const newUSDTBalanceOfCertik = await usdt.balanceOf(CERTIK_RECEIVER);
      const newUSDCBalanceOfQuantstamp = await usdc.balanceOf(QUANTSTAMP_RECEIVER);
      const newBNBBalanceOfTreasury = await ethers.provider.getBalance(TREASURY);
      const newUSDTBalanceOfCommunity = await usdt.balanceOf(COMMUNITY_RECEIVER);
      const newXVSBalanceOfXVSReceiver = await xvs.balanceOf(XVS_RECEIVER);

      expect(newUSDTBalanceOfCertik).to.be.eq(prevUSDTBalanceOfCertik.add(parseUnits("19000", 18)));
      expect(newUSDCBalanceOfQuantstamp).to.be.eq(prevUSDCBalanceOfQuantstamp.add(parseUnits("32500", 18)));
      expect(newBNBBalanceOfTreasury).to.be.eq(prevBNBBalanceOfTreasury.sub(parseUnits("1", 18)));
      expect(newUSDTBalanceOfCommunity).to.be.eq(prevUSDTBalanceOfCommunity.add(parseUnits("44500", 18)));
      expect(newXVSBalanceOfXVSReceiver).to.be.eq(prevXVSBalanceOfXVSReceiver.add(parseUnits("620", 18)));
    });
  });
});
