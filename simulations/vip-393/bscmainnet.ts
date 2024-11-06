import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip393, { COMMUNITY_WALLET, USDC } from "../../vips/vip-393/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import ERC20_ABI from "./abi/erc20.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(43777987, async () => {
  let oldUsdcWalletBalance: BigNumber;
  let oldUsdcTreasuryBalance: BigNumber;
  let usdc: Contract;

  before(async () => {
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    oldUsdcWalletBalance = await usdc.balanceOf(COMMUNITY_WALLET);
    oldUsdcTreasuryBalance = await usdc.balanceOf(bscmainnet.VTREASURY);
  });

  testVip("vip393", await vip393(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
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
