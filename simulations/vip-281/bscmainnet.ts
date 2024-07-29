import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  COMMUNITY_WALLET,
  COMMUNITY_WALLET_USDT_AMOUNT,
  TOKEN_REDEEMER,
  USDT,
  shortfalls,
  vTokenConfigs,
  vip281,
} from "../../vips/vip-281/bscmainnet";
import ERC20_ABI from "./abi/IERC20.json";
import VTOKEN_ABI from "./abi/VBep20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const blockNumber = 37541463;
forking(blockNumber, async () => {
  let usdt: Contract;
  let prevUSDTBalanceOfCommunityWallet: BigNumber;

  const vTokenAt = (vTokenAddress: string): Contract => {
    return new Contract(vTokenAddress, VTOKEN_ABI, ethers.provider);
  };

  const erc20At = (tokenAddress: string): Contract => {
    return new Contract(tokenAddress, ERC20_ABI, ethers.provider);
  };

  before(async () => {
    usdt = await erc20At(USDT);
    prevUSDTBalanceOfCommunityWallet = await usdt.balanceOf(COMMUNITY_WALLET);
  });

  testVip("VIP-281", await vip281(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["RepayBorrow"], [33]);
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [9]);
    },
  });

  describe("Post-VIP behavior", () => {
    const daiBorrower = "0x6f9Ac5B3Fa4308620C6763D9aA5a65446E75F5b5";
    it(`PARTIALLY repays DAI debt of ${daiBorrower}`, async () => {
      const vDAI = vTokenAt(vTokenConfigs["vDAI"].address);
      const remainingDebt = await vDAI.callStatic.borrowBalanceCurrent(daiBorrower);
      expect(remainingDebt).to.equal(parseUnits("2767.558971124921004496"));
    });

    const vTokenConfigEntries = Object.entries(vTokenConfigs) as [string, { address: string; underlying: string }][];
    for (const [symbol, vTokenConfig] of vTokenConfigEntries.filter(([s]) => s !== "vDAI")) {
      for (const borrower of shortfalls[vTokenConfig.address]) {
        it(`repays ${symbol.slice(1)} debt of ${borrower} in full`, async () => {
          const vToken = new Contract(vTokenConfig.address, VTOKEN_ABI, ethers.provider);
          expect(await vToken.callStatic.borrowBalanceCurrent(borrower)).to.equal(0);
        });
      }
    }

    for (const [symbol, vTokenConfig] of vTokenConfigEntries) {
      it(`does not keep any ${symbol} in the redeemer`, async () => {
        expect(await vTokenAt(vTokenConfig.address).balanceOf(TOKEN_REDEEMER)).to.equal(0);
      });

      it(`does not keep any ${symbol.slice(1)} in the redeemer`, async () => {
        if (vTokenConfig.underlying === ethers.constants.AddressZero) {
          expect(await ethers.provider.getBalance(TOKEN_REDEEMER)).to.equal(0);
        } else {
          expect(await erc20At(vTokenConfig.underlying).balanceOf(TOKEN_REDEEMER)).to.equal(0);
        }
      });
    }

    it("transfer USDT to the Community Wallet", async () => {
      const newUSDTBalanceOfCommunityWallet = await usdt.balanceOf(COMMUNITY_WALLET);
      expect(newUSDTBalanceOfCommunityWallet).to.be.eq(
        prevUSDTBalanceOfCommunityWallet.add(COMMUNITY_WALLET_USDT_AMOUNT),
      );
    });
  });
});
