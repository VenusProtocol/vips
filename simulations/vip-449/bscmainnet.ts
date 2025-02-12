import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip449, {
  ETH,
  ETH_AMOUNT_TO_LIQUIDITY_PROVIDER,
  LIQUIDITY_PROVIDER,
  USDC,
  USDC_AMOUNT_TO_VANGUARD_TREASURY,
  VANGUARD_TREASURY,
} from "../../vips/vip-449/bscmainnet";
import VTREASURY_ABI from "./abi/VTreasury.json";
import ERC20_ABI from "./abi/erc20.json";

forking(46592560, async () => {
  const provider = ethers.provider;
  let usdc: Contract;
  let eth: Contract;
  let usdcBalanceOfVanguardTreasury: BigNumber;
  let ethBalanceOfLiquidityProvider: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, ERC20_ABI, provider);
    eth = new ethers.Contract(ETH, ERC20_ABI, provider);

    usdcBalanceOfVanguardTreasury = await usdc.balanceOf(VANGUARD_TREASURY);
    ethBalanceOfLiquidityProvider = await eth.balanceOf(LIQUIDITY_PROVIDER);
  });

  testVip("vip-449", await vip449(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [2]);
    },
  });

  describe("Post-VIP behavior", () => {
    describe("transferred funds", () => {
      it("check usdc balance of Vanguard Treasury", async () => {
        const newBalance = await usdc.balanceOf(VANGUARD_TREASURY);
        expect(newBalance).to.equals(usdcBalanceOfVanguardTreasury.add(USDC_AMOUNT_TO_VANGUARD_TREASURY));
      });

      it("check eth balance of Liquidity Provider", async () => {
        const newBalance = await eth.balanceOf(LIQUIDITY_PROVIDER);
        expect(newBalance).to.equals(ethBalanceOfLiquidityProvider.add(ETH_AMOUNT_TO_LIQUIDITY_PROVIDER));
      });
    });
  });
});
