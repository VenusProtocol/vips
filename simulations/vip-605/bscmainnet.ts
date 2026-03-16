import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  CAKE,
  CAKE_AMOUNT,
  DEV_WALLET,
  RISK_FUND,
  THE,
  THE_AMOUNT,
  USDT,
  USDT_EQUIVALENT_FOR_TOKENS,
  USDT_TO_DEV_WALLET,
  WBNB,
  WBNB_TO_DEV_WALLET,
  vip605,
} from "../../vips/vip-605/bscmainnet";
import VTREASURY_ABI from "./abi/VTreasury.json";
import ERC20_ABI from "./abi/erc20.json";
import RISK_FUND_ABI from "./abi/riskFund.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(86918897, async () => {
  const provider = ethers.provider;

  let usdt: Contract;
  let cake: Contract;
  let the: Contract;
  let wbnb: Contract;

  let treasuryCakeBalanceBefore: BigNumber;
  let treasuryTheBalanceBefore: BigNumber;
  let treasuryUsdtBalanceBefore: BigNumber;
  let riskFundUsdtBalanceBefore: BigNumber;
  let riskFundWbnbBalanceBefore: BigNumber;
  let devWalletCakeBalanceBefore: BigNumber;
  let devWalletTheBalanceBefore: BigNumber;
  let devWalletUsdtBalanceBefore: BigNumber;
  let devWalletWbnbBalanceBefore: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(USDT, ERC20_ABI, provider);
    cake = new ethers.Contract(CAKE, ERC20_ABI, provider);
    the = new ethers.Contract(THE, ERC20_ABI, provider);
    wbnb = new ethers.Contract(WBNB, ERC20_ABI, provider);

    treasuryCakeBalanceBefore = await cake.balanceOf(bscmainnet.VTREASURY);
    treasuryTheBalanceBefore = await the.balanceOf(bscmainnet.VTREASURY);
    treasuryUsdtBalanceBefore = await usdt.balanceOf(bscmainnet.VTREASURY);
    riskFundUsdtBalanceBefore = await usdt.balanceOf(RISK_FUND);
    riskFundWbnbBalanceBefore = await wbnb.balanceOf(RISK_FUND);
    devWalletCakeBalanceBefore = await cake.balanceOf(DEV_WALLET);
    devWalletTheBalanceBefore = await the.balanceOf(DEV_WALLET);
    devWalletUsdtBalanceBefore = await usdt.balanceOf(DEV_WALLET);
    devWalletWbnbBalanceBefore = await wbnb.balanceOf(DEV_WALLET);
  });

  testVip("VIP-605", await vip605(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [2]);
      await expectEvents(txResponse, [RISK_FUND_ABI], ["SweepTokenFromPool"], [3]);
    },
  });

  describe("Post-VIP behavior", () => {
    // Part 1: Treasury token sale
    it("should transfer CAKE from treasury to dev wallet", async () => {
      const treasuryCakeBalanceAfter = await cake.balanceOf(bscmainnet.VTREASURY);
      expect(treasuryCakeBalanceAfter).equals(treasuryCakeBalanceBefore.sub(CAKE_AMOUNT));

      const devWalletCakeBalanceAfter = await cake.balanceOf(DEV_WALLET);
      expect(devWalletCakeBalanceAfter).equals(devWalletCakeBalanceBefore.add(CAKE_AMOUNT));
    });

    it("should transfer THE from treasury to dev wallet", async () => {
      const treasuryTheBalanceAfter = await the.balanceOf(bscmainnet.VTREASURY);
      expect(treasuryTheBalanceAfter).equals(treasuryTheBalanceBefore.sub(THE_AMOUNT));

      const devWalletTheBalanceAfter = await the.balanceOf(DEV_WALLET);
      expect(devWalletTheBalanceAfter).equals(devWalletTheBalanceBefore.add(THE_AMOUNT));
    });

    it("should transfer equivalent USDT from risk fund to treasury", async () => {
      const treasuryUsdtBalanceAfter = await usdt.balanceOf(bscmainnet.VTREASURY);
      expect(treasuryUsdtBalanceAfter).equals(treasuryUsdtBalanceBefore.add(USDT_EQUIVALENT_FOR_TOKENS));
    });

    // Part 2: Remaining bad debt via OTC
    it("should sweep USDT from risk fund to dev wallet", async () => {
      const devWalletUsdtBalanceAfter = await usdt.balanceOf(DEV_WALLET);
      expect(devWalletUsdtBalanceAfter).equals(devWalletUsdtBalanceBefore.add(USDT_TO_DEV_WALLET));
    });

    it("should sweep WBNB from risk fund to dev wallet", async () => {
      const devWalletWbnbBalanceAfter = await wbnb.balanceOf(DEV_WALLET);
      expect(devWalletWbnbBalanceAfter).equals(devWalletWbnbBalanceBefore.add(WBNB_TO_DEV_WALLET));
    });

    it("should decrease risk fund USDT balance", async () => {
      const riskFundUsdtBalanceAfter = await usdt.balanceOf(RISK_FUND);
      expect(riskFundUsdtBalanceAfter).equals(
        riskFundUsdtBalanceBefore.sub(USDT_EQUIVALENT_FOR_TOKENS).sub(USDT_TO_DEV_WALLET),
      );
    });

    it("should decrease risk fund WBNB balance", async () => {
      const riskFundWbnbBalanceAfter = await wbnb.balanceOf(RISK_FUND);
      expect(riskFundWbnbBalanceAfter).equals(riskFundWbnbBalanceBefore.sub(WBNB_TO_DEV_WALLET));
    });
  });
});
