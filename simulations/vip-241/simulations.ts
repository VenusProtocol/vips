import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  BTC,
  BTC_AMOUNT,
  BTC_DISTRIBUTION_SPEED,
  ETH,
  ETH_AMOUNT,
  ETH_DISTRIBUTION_SPEED,
  PLP,
  USDC,
  USDC_AMOUNT,
  USDC_DISTRIBUTION_SPEED,
  USDT,
  USDT_AMOUNT,
  USDT_DISTRIBUTION_SPEED,
  VTREASURY,
  vip241,
} from "../../vips/vip-241";
import ERC20_ABI from "./abi/ERC20.json";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import VTreasurer_ABI from "./abi/VTreasury.json";

forking(35355081, () => {
  let btc: ethers.Contract;
  let eth: ethers.Contract;
  let usdc: ethers.Contract;
  let usdt: ethers.Contract;
  let oldBTCBal: BigNumber;
  let oldETHBal: BigNumber;
  let oldUSDCBal: BigNumber;
  let oldUSDTBal: BigNumber;
  let oldBTCBalTreasury: BigNumber;
  let oldETHBalTreasury: BigNumber;
  let oldUSDCBalTreasury: BigNumber;
  let oldUSDTBalTreasury: BigNumber;
  let plp: ethers.Contract;

  before(async () => {
    btc = new ethers.Contract(BTC, ERC20_ABI, ethers.provider);
    oldBTCBal = await btc.balanceOf(PLP);
    oldBTCBalTreasury = await btc.balanceOf(VTREASURY);

    eth = new ethers.Contract(ETH, ERC20_ABI, ethers.provider);
    oldETHBal = await eth.balanceOf(PLP);
    oldETHBalTreasury = await eth.balanceOf(VTREASURY);

    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    oldUSDCBal = await usdc.balanceOf(PLP);
    oldUSDCBalTreasury = await usdc.balanceOf(VTREASURY);

    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    oldUSDTBal = await usdt.balanceOf(PLP);
    oldUSDTBalTreasury = await usdt.balanceOf(VTREASURY);

    plp = new ethers.Contract(PLP, PLP_ABI, ethers.provider);
  });

  testVip("VIP-241", vip241(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurer_ABI], ["WithdrawTreasuryBEP20"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should transfer ETH", async () => {
      const currETHBal = await eth.balanceOf(PLP);
      expect(currETHBal.sub(oldETHBal)).equals(ETH_AMOUNT);
      const currETHBalTreasury = await eth.balanceOf(VTREASURY);
      expect(currETHBalTreasury.add(ETH_AMOUNT)).equals(oldETHBalTreasury);
    });

    it("Should transfer BTC", async () => {
      const currBTCBal = await btc.balanceOf(PLP);
      expect(currBTCBal.sub(oldBTCBal)).equals(BTC_AMOUNT);
      const currBTCBalTreasury = await btc.balanceOf(VTREASURY);
      expect(currBTCBalTreasury.add(BTC_AMOUNT)).equals(oldBTCBalTreasury);
    });

    it("Should transfer USDC", async () => {
      const currUSDCBal = await usdc.balanceOf(PLP);
      expect(currUSDCBal.sub(oldUSDCBal)).equals(USDC_AMOUNT);
      const currUSDCBalTreasury = await usdc.balanceOf(VTREASURY);
      expect(currUSDCBalTreasury.add(USDC_AMOUNT)).equals(oldUSDCBalTreasury);
    });

    it("Should transfer USDT", async () => {
      const currUSDTBal = await usdt.balanceOf(PLP);
      expect(currUSDTBal.sub(oldUSDTBal)).equals(USDT_AMOUNT);
      const currUSDTBalTreasury = await usdt.balanceOf(VTREASURY);
      expect(currUSDTBalTreasury.add(USDT_AMOUNT)).equals(oldUSDTBalTreasury);
    });

    it("Check distribution speeds", async () => {
      let speed = await plp.tokenDistributionSpeeds(ETH);
      expect(speed).equals(ETH_DISTRIBUTION_SPEED);
      speed = await plp.tokenDistributionSpeeds(BTC);
      expect(speed).equals(BTC_DISTRIBUTION_SPEED);
      speed = await plp.tokenDistributionSpeeds(USDC);
      expect(speed).equals(USDC_DISTRIBUTION_SPEED);
      speed = await plp.tokenDistributionSpeeds(USDT);
      expect(speed).equals(USDT_DISTRIBUTION_SPEED);
    });
  });
});
