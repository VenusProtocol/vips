import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip359, {
  CERTIK,
  CERTIK_AMOUNT_USDT,
  COMMUNITY,
  COMMUNITY_AMOUNT_ETH,
  COMMUNITY_AMOUNT_USDT,
  ETH,
  NODEREAL,
  NODEREAL_AMOUNT_USDT,
  REDSTONE,
  REDSTONE_AMOUNT_USDC,
  USDC,
  USDT,
} from "../../vips/vip-359/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

forking(41811557, async () => {
  let usdc: Contract;
  let usdt: Contract;
  let eth: Contract;

  let prevUSDTBalanceOfCertik: BigNumber;
  let prevUSDTBalanceOfNodereal: BigNumber;
  let prevUSDCBalanceOfRedstone: BigNumber;
  let prevETHBalanceOfCommunity: BigNumber;
  let prevUSDTBalanceOfCommunity: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    eth = new ethers.Contract(ETH, ERC20_ABI, ethers.provider);

    prevUSDTBalanceOfCertik = await usdt.balanceOf(CERTIK);
    prevUSDTBalanceOfNodereal = await usdt.balanceOf(NODEREAL);
    prevUSDCBalanceOfRedstone = await usdc.balanceOf(REDSTONE);
    prevETHBalanceOfCommunity = await eth.balanceOf(COMMUNITY);
    prevUSDTBalanceOfCommunity = await usdt.balanceOf(COMMUNITY);
  });

  testVip("VIP-359", await vip359(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [5]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const usdtBalanceOfCertik = await usdt.balanceOf(CERTIK);
      const usdtBalanceOfNodereal = await usdt.balanceOf(NODEREAL);
      const usdcBalanceOfRedstone = await usdc.balanceOf(REDSTONE);
      const ethBalanceOfCommunity = await eth.balanceOf(COMMUNITY);
      const usdtBalanceOfCommunity = await usdt.balanceOf(COMMUNITY);

      expect(usdtBalanceOfCertik.sub(prevUSDTBalanceOfCertik)).to.equal(CERTIK_AMOUNT_USDT);
      expect(usdtBalanceOfNodereal.sub(prevUSDTBalanceOfNodereal)).to.equal(NODEREAL_AMOUNT_USDT);
      expect(usdcBalanceOfRedstone.sub(prevUSDCBalanceOfRedstone)).to.equal(REDSTONE_AMOUNT_USDC);
      expect(ethBalanceOfCommunity.sub(prevETHBalanceOfCommunity)).to.equal(COMMUNITY_AMOUNT_ETH);
      expect(usdtBalanceOfCommunity.sub(prevUSDTBalanceOfCommunity)).to.equal(COMMUNITY_AMOUNT_USDT);
    });
  });
});
