import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { TOKEN_REDEEMER } from "../../vips/vip-253/bscmainnet";
import vip333, {
  TREASURY,
  USDC,
  VANGUARD_VANTAGE_AMOUNT,
  VANGUARD_VANTAGE_WALLET,
  VUSDC,
} from "../../vips/vip-333/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VBEP20_ABI from "./abi/VBep20.json";

forking(39954538, () => {
  let usdc: Contract;
  let vusdc: Contract;
  let prevUSDTBalanceVanguardVantageWallet: BigNumber;

  before(async () => {
    usdc = await ethers.getContractAt(ERC20_ABI, USDC);
    vusdc = await ethers.getContractAt(VBEP20_ABI, VUSDC);
    prevUSDTBalanceVanguardVantageWallet = await usdc.balanceOf(VANGUARD_VANTAGE_WALLET);
    console.log((await usdc.balanceOf(TREASURY)).toString());
  });

  testVip("VIP-333", vip333(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ERC20_ABI], ["Transfer"], [2]);
    },
  });

  describe("Post-Execution state", () => {
    it(`does not keep any vUSDC in the redeemer`, async () => {
      expect(await vusdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });

    it(`does not keep any USDC in the redeemer`, async () => {
      expect(await usdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });

    it("check Vanguard Vantage wallet usdc balance after execution", async () => {
      expect(await usdc.balanceOf(VANGUARD_VANTAGE_WALLET)).to.equal(
        prevUSDTBalanceVanguardVantageWallet.add(VANGUARD_VANTAGE_AMOUNT),
      );
    });
  });
});
