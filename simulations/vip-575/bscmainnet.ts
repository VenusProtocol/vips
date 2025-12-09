import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import { RECEIVER_ADDRESS, vip575, vlisUSD, vlisUSD_AMOUNT } from "../../vips/vip-575/bscmainnet";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(71031323, async () => {
  const vlisUSDContract = new ethers.Contract(vlisUSD, VTOKEN_ABI, ethers.provider);

  describe("Pre-VIP behaviour", async () => {
    it("check vlisUSD balance", async () => {
      let balance = await vlisUSDContract.balanceOf(bscmainnet.NORMAL_TIMELOCK);
      expect(balance).to.be.equal(parseUnits("999989.99999999", 8));

      balance = await vlisUSDContract.balanceOf(RECEIVER_ADDRESS);
      expect(balance).to.be.equal(0);
    });

    it("check exchange rate", async () => {
      const exchangeRate = await vlisUSDContract.exchangeRateStored();
      const lisUSDAmount = exchangeRate.mul(vlisUSD_AMOUNT).div(parseUnits("1", 18));
      expect(lisUSDAmount).to.be.equal(parseUnits("1015299.578569802594352060", 18));
    });
  });

  testVip("VIP-575", await vip575());

  describe("Post-VIP behavior", async () => {
    it("check vlisUSD balance", async () => {
      let balance = await vlisUSDContract.balanceOf(bscmainnet.NORMAL_TIMELOCK);
      expect(balance).to.be.equal(parseUnits("0.99999999", 8));

      balance = await vlisUSDContract.balanceOf(RECEIVER_ADDRESS);
      expect(balance).to.be.equal(parseUnits("999989", 8));
    });
  });
});
