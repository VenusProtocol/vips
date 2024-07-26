import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip344, {
  CERTIK,
  CERTIK_AMOUNT,
  CHAINALYSIS_AMOUNT,
  CHAINPATROL,
  CHAINPATROL_AMOUNT,
  CHAOSLABS,
  CHAOS_LABS_AMOUNT,
  COMMUNITY,
  COMMUNITY_BNB_AMOUNT,
  COMMUNITY_USDC_AMOUNT,
  COMMUNITY_USDT_AMOUNT,
  FAIRYPROOF,
  FAIRYPROOF_AMOUNT,
  SKYNET,
  SKYNET_BNB_AMOUNT,
  SKYNET_XVS_AMOUNT,
  TOKEN_REDEEMER,
  USDC,
  USDT,
  XVS,
  vUSDC,
} from "../../vips/vip-344/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

forking(40805481, async () => {
  let usdc: Contract;
  let usdt: Contract;
  let xvs: Contract;
  let vusdc: Contract;

  let prevCertikBalance: BigNumber;
  let prevFairyProofBalance: BigNumber;
  let prevChaosLabsBalance: BigNumber;
  let prevBNBBalanceOfSkynet: BigNumber;
  let prevXVSBalanceOfSkynet: BigNumber;
  let prevBNBBalanceOfCommunity: BigNumber;
  let prevUSDCBalanceOfCommunity: BigNumber;
  let prevUSDTBalanceOfCommunity: BigNumber;
  let prevChainPatrolBalance: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    xvs = new ethers.Contract(XVS, ERC20_ABI, ethers.provider);
    vusdc = new ethers.Contract(vUSDC, ERC20_ABI, ethers.provider);

    prevCertikBalance = await usdt.balanceOf(CERTIK);
    prevFairyProofBalance = await usdt.balanceOf(FAIRYPROOF);
    prevChaosLabsBalance = await usdc.balanceOf(CHAOSLABS);
    prevBNBBalanceOfSkynet = await ethers.provider.getBalance(SKYNET);
    prevXVSBalanceOfSkynet = await xvs.balanceOf(SKYNET);
    prevBNBBalanceOfCommunity = await ethers.provider.getBalance(COMMUNITY);
    prevUSDCBalanceOfCommunity = await usdc.balanceOf(COMMUNITY);
    prevUSDTBalanceOfCommunity = await usdt.balanceOf(COMMUNITY);
    prevChainPatrolBalance = await usdt.balanceOf(CHAINPATROL);
  });

  testVip("VIP-344", await vip344(), {
    supporter: "0x55a9f5374af30e3045fb491f1da3c2e8a74d168d",
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [9]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const certikBalance = await usdt.balanceOf(CERTIK);
      const fairyProofBalance = await usdt.balanceOf(FAIRYPROOF);
      const chaosLabsBalance = await usdc.balanceOf(CHAOSLABS);
      const bnbBalanceOfSkynet = await ethers.provider.getBalance(SKYNET);
      const xvsBalanceOfSkynet = await xvs.balanceOf(SKYNET);
      const bnbBalanceOfCommunity = await ethers.provider.getBalance(COMMUNITY);
      const usdcBalanceOfCommunity = await usdc.balanceOf(COMMUNITY);
      const usdtBalanceOfCommunity = await usdt.balanceOf(COMMUNITY);
      const chainPatrolBalance = await usdt.balanceOf(CHAINPATROL);

      expect(certikBalance.sub(prevCertikBalance)).to.equal(CERTIK_AMOUNT);
      expect(fairyProofBalance.sub(prevFairyProofBalance)).to.equal(FAIRYPROOF_AMOUNT);

      console.log(bnbBalanceOfCommunity.toString());

      expect(chaosLabsBalance.sub(prevChaosLabsBalance)).to.equal(CHAOS_LABS_AMOUNT);
      expect(bnbBalanceOfSkynet.sub(prevBNBBalanceOfSkynet)).to.equal(SKYNET_BNB_AMOUNT);
      expect(xvsBalanceOfSkynet.sub(prevXVSBalanceOfSkynet)).to.equal(SKYNET_XVS_AMOUNT);

      expect(bnbBalanceOfCommunity.sub(prevBNBBalanceOfCommunity)).to.equal(COMMUNITY_BNB_AMOUNT);

      expect(usdcBalanceOfCommunity.sub(prevUSDCBalanceOfCommunity)).to.equal(
        COMMUNITY_USDC_AMOUNT.add(CHAINALYSIS_AMOUNT),
      );

      expect(usdtBalanceOfCommunity.sub(prevUSDTBalanceOfCommunity)).to.equal(COMMUNITY_USDT_AMOUNT);

      expect(chainPatrolBalance.sub(prevChainPatrolBalance)).to.equal(CHAINPATROL_AMOUNT);
    });

    it(`does not keep any vUSDC in the redeemer`, async () => {
      expect(await vusdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });

    it(`does not keep any USDC in the redeemer`, async () => {
      expect(await usdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });
  });
});
