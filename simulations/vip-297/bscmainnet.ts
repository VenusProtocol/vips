import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  CERTIK,
  CERTIK_AMOUNT,
  CHAOS_LABS,
  CHAOS_LABS_AMOUNT,
  COMMUNITY_WALLET,
  COMMUNITY_WALLET_AMOUNT,
  FAIRYPROOF,
  FAIRYPROOF_AMOUNT,
  PESSIMISTIC,
  PESSIMISTIC_AMOUNT,
  QUANTSTAMP,
  QUANTSTAMP_AMOUNT,
  REDEEM_USDC_AMOUNT,
  REDEEM_USDT_AMOUNT,
  SKYNET,
  SKYNET_USDT_AMOUNT_DIRECT,
  USDC,
  USDT,
  vip297,
} from "../../vips/vip-297/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import REWARD_FACET_ABI from "./abi/RewardFacet.json";
import VTREASURY_ABI from "./abi/VTreasuryAbi.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(38201134, () => {
  let usdt: Contract;
  let usdc: Contract;
  let prevUSDCBalanceTreasury: BigNumber;
  let prevUSDTBalanceTreasury: BigNumber;
  let prevCertikBalance: BigNumber;
  let prevQuantstampBalance: BigNumber;
  let prevPessimisticBalance: BigNumber;
  let prevFairyproofBalance: BigNumber;
  let prevChaosLabsBalance: BigNumber;
  let prevCommunityWalletBalance: BigNumber;
  let prevSkynetBalance: BigNumber;

  before(async () => {
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);
    usdc = await ethers.getContractAt(ERC20_ABI, USDC);
    prevUSDTBalanceTreasury = await usdt.balanceOf(bscmainnet.VTREASURY);
    prevUSDCBalanceTreasury = await usdc.balanceOf(bscmainnet.VTREASURY);
    prevCertikBalance = await usdt.balanceOf(CERTIK);
    prevQuantstampBalance = await usdc.balanceOf(QUANTSTAMP);
    prevPessimisticBalance = await usdt.balanceOf(PESSIMISTIC);
    prevFairyproofBalance = await usdt.balanceOf(FAIRYPROOF);
    prevChaosLabsBalance = await usdc.balanceOf(CHAOS_LABS);
    prevCommunityWalletBalance = await usdt.balanceOf(COMMUNITY_WALLET);
    prevSkynetBalance = await usdt.balanceOf(SKYNET);
  });

  testVip("VIP-297", vip297(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [9]);
      await expectEvents(txResponse, [REWARD_FACET_ABI], ["VenusGranted"], [1]);
    },
  });

  describe("Post-Execution state", () => {
    it("check treasury balance after execution", async () => {
      expect(await usdt.balanceOf(bscmainnet.VTREASURY)).to.equal(
        prevUSDTBalanceTreasury
          .sub(CERTIK_AMOUNT)
          .sub(PESSIMISTIC_AMOUNT)
          .sub(FAIRYPROOF_AMOUNT)
          .sub(COMMUNITY_WALLET_AMOUNT)
          .sub(SKYNET_USDT_AMOUNT_DIRECT),
      );
      expect(await usdc.balanceOf(bscmainnet.VTREASURY)).to.equal(
        prevUSDCBalanceTreasury.sub(QUANTSTAMP_AMOUNT).sub(CHAOS_LABS_AMOUNT),
      );
    });

    it("check Certik balance after execution", async () => {
      expect(await usdt.balanceOf(CERTIK)).to.equal(prevCertikBalance.add(CERTIK_AMOUNT));
    });

    it("check Quantstamp balance after execution", async () => {
      expect(await usdc.balanceOf(QUANTSTAMP)).to.equal(prevQuantstampBalance.add(QUANTSTAMP_AMOUNT));
    });

    it("check Pessimistic balance after execution", async () => {
      expect(await usdt.balanceOf(PESSIMISTIC)).to.equal(prevPessimisticBalance.add(PESSIMISTIC_AMOUNT));
    });

    it("check Fairyproof balance after execution", async () => {
      expect(await usdt.balanceOf(FAIRYPROOF)).to.equal(prevFairyproofBalance.add(FAIRYPROOF_AMOUNT));
    });

    it("check Chaos Labs balance after execution", async () => {
      expect(await usdc.balanceOf(CHAOS_LABS)).to.closeTo(
        prevChaosLabsBalance.add(CHAOS_LABS_AMOUNT).add(REDEEM_USDC_AMOUNT),
        parseUnits("100", 18),
      );
    });

    it("check Community Wallet balance after execution", async () => {
      expect(await usdt.balanceOf(COMMUNITY_WALLET)).to.equal(prevCommunityWalletBalance.add(COMMUNITY_WALLET_AMOUNT));
    });

    it("check skynet balance after execution", async () => {
      expect(await usdt.balanceOf(SKYNET)).to.closeTo(
        prevSkynetBalance.add(SKYNET_USDT_AMOUNT_DIRECT).add(REDEEM_USDT_AMOUNT),
        parseUnits("600", 18),
      );
    });
  });
});
