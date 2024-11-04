import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { COMMUNITY_WALLET, USDC, vip392 } from "../../vips/vip-392/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VtreasuryAbi.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(43720400, async () => {
  let oldUsdcWalletBalance: BigNumber;
  let oldUsdcTreasuryBalance: BigNumber;
  let usdc: Contract;

  before(async () => {
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    oldUsdcWalletBalance = await usdc.balanceOf(COMMUNITY_WALLET);
    oldUsdcTreasuryBalance = await usdc.balanceOf(bscmainnet.VTREASURY);
  });

  testVip("VIP-392 Refund USDC to community wallet", await vip392(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [1]);
    },
  });
  describe("Post-VIP behavior", async () => {
    it("Verify that the community wallet has received the correct amount of USDC", async () => {
      const walletBalance = await usdc.balanceOf(COMMUNITY_WALLET);
      const treasuryBalance = await usdc.balanceOf(bscmainnet.VTREASURY);
      expect(walletBalance).to.eq(oldUsdcWalletBalance.add(parseUnits("5000", 18)));
      expect(treasuryBalance).to.eq(oldUsdcTreasuryBalance.sub(parseUnits("5000", 18)));
    });
  });
});
