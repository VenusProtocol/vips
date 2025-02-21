import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip465, { USDT, VANGUARD_TREASURY } from "../../vips/vip-465/bscmainnet";
import VTREASURY_ABI from "./abi/VTreasury.json";
import ERC20_ABI from "./abi/erc20.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(46852890, async () => {
  const provider = ethers.provider;
  let usdt: Contract;
  let usdtBalanceOfVanguardTreasury: BigNumber;
  let usdtTreasuryBalanceBefore: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(USDT, ERC20_ABI, provider);

    usdtBalanceOfVanguardTreasury = await usdt.balanceOf(VANGUARD_TREASURY);
    usdtTreasuryBalanceBefore = await usdt.balanceOf(bscmainnet.VTREASURY);
  });

  testVip("vip-465", await vip465(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    describe("transferred funds", () => {
      it("check usdt balance of Vanguard Treasury", async () => {
        const newBalance = await usdt.balanceOf(VANGUARD_TREASURY);
        expect(newBalance).to.equals(usdtBalanceOfVanguardTreasury.add(parseUnits("5000", 18)));
      });

      it("check usdt balance of Treasury", async () => {
        const newBalance = await usdt.balanceOf(bscmainnet.VTREASURY);
        expect(newBalance).to.equals(usdtTreasuryBalanceBefore.sub(parseUnits("5000", 18)));
      });
    });
  });
});
