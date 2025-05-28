import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip504, { USDT, USDT_AMOUNT, VTOKEN_RECEIVER } from "../../vips/vip-504/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import VTREASURY_ABI from "./abi/VTreasuryBEP20.json";
import ERC20_ABI from "./abi/erc20.json";

const { VTREASURY } = NETWORK_ADDRESSES.bscmainnet;

forking(49928270, async () => {
  const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
  let prevUSDTBalanceOfTreasury: BigNumber;
  let prevUSDTBalanceOfReceiver: BigNumber;

  before(async () => {
    prevUSDTBalanceOfTreasury = await usdt.balanceOf(VTREASURY);
    prevUSDTBalanceOfReceiver = await usdt.balanceOf(VTOKEN_RECEIVER);
  });

  testVip("VIP-504 bscmainnet", await vip504(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI, VTREASURY_ABI],
        ["ExecuteRemoteProposal", "StorePayload", "WithdrawTreasuryBEP20"],
        [1, 0, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balance", async () => {
      const currentUSDTBalanceOfTreasury = await usdt.balanceOf(VTREASURY);
      const currentUSDTBalanceOfReceiver = await usdt.balanceOf(VTOKEN_RECEIVER);

      expect(currentUSDTBalanceOfTreasury).equals(prevUSDTBalanceOfTreasury.sub(USDT_AMOUNT));
      expect(currentUSDTBalanceOfReceiver).equals(prevUSDTBalanceOfReceiver.add(USDT_AMOUNT));
    });
  });
});
