import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip334, {
  COMMUNITY_WALLET,
  TREASURY,
  USDC,
  USDC_AMOUNT,
  USDT,
  USDT_AMOUNT,
  WBTC,
  WBTC_AMOUNT,
  WETH,
  WETH_AMOUNT,
} from "../../vips/vip-334/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";

forking(40155663, async () => {
  let usdc: Contract;
  let usdt: Contract;
  let wbtc: Contract;
  let weth: Contract;

  let prevUSDCBalanceTreasury: BigNumber;
  let prevUSDTBalanceTreasury: BigNumber;
  let prevWBTCBalanceTreasury: BigNumber;
  let prevWETHBalanceTreasury: BigNumber;

  let prevUSDCBalanceCommunityWallet: BigNumber;
  let prevUSDTBalanceCommunityWallet: BigNumber;
  let prevWBTCBalanceCommunityWallet: BigNumber;
  let prevWETHBalanceCommunityWallet: BigNumber;

  before(async () => {
    usdc = await ethers.getContractAt(ERC20_ABI, USDC);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);
    wbtc = await ethers.getContractAt(ERC20_ABI, WBTC);
    weth = await ethers.getContractAt(ERC20_ABI, WETH);

    prevUSDCBalanceTreasury = await usdc.balanceOf(TREASURY);
    prevUSDTBalanceTreasury = await usdt.balanceOf(TREASURY);
    prevWBTCBalanceTreasury = await wbtc.balanceOf(TREASURY);
    prevWETHBalanceTreasury = await weth.balanceOf(TREASURY);

    prevUSDCBalanceCommunityWallet = await usdc.balanceOf(COMMUNITY_WALLET);
    prevUSDTBalanceCommunityWallet = await usdt.balanceOf(COMMUNITY_WALLET);
    prevWBTCBalanceCommunityWallet = await wbtc.balanceOf(COMMUNITY_WALLET);
    prevWETHBalanceCommunityWallet = await weth.balanceOf(COMMUNITY_WALLET);
  });

  testVip("VIP-334", await vip334(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ERC20_ABI], ["Transfer"], [4]);
    },
  });

  describe("Post-Execution state", () => {
    it("check Treausury usdc balance after execution", async () => {
      expect(await usdc.balanceOf(TREASURY)).to.equal(prevUSDCBalanceTreasury.sub(USDC_AMOUNT));
    });

    it("check community wallet usdc balance after execution", async () => {
      expect(await usdc.balanceOf(COMMUNITY_WALLET)).to.equal(prevUSDCBalanceCommunityWallet.add(USDC_AMOUNT));
    });

    it("check Treausury usdt balance after execution", async () => {
      expect(await usdt.balanceOf(TREASURY)).to.equal(prevUSDTBalanceTreasury.sub(USDT_AMOUNT));
    });

    it("check community wallet usdt balance after execution", async () => {
      expect(await usdt.balanceOf(COMMUNITY_WALLET)).to.equal(prevUSDTBalanceCommunityWallet.add(USDT_AMOUNT));
    });

    it("check Treausury wbtc balance after execution", async () => {
      expect(await wbtc.balanceOf(TREASURY)).to.equal(prevWBTCBalanceTreasury.sub(WBTC_AMOUNT));
    });

    it("check community wallet wbtc balance after execution", async () => {
      expect(await wbtc.balanceOf(COMMUNITY_WALLET)).to.equal(prevWBTCBalanceCommunityWallet.add(WBTC_AMOUNT));
    });

    it("check Treausury weth balance after execution", async () => {
      expect(await weth.balanceOf(TREASURY)).to.equal(prevWETHBalanceTreasury.sub(WETH_AMOUNT));
    });

    it("check community wallet weth balance after execution", async () => {
      expect(await weth.balanceOf(COMMUNITY_WALLET)).to.equal(prevWETHBalanceCommunityWallet.add(WETH_AMOUNT));
    });
  });
});
