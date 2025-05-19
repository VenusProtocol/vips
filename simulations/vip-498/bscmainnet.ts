import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip498, { USDT, VANGUARD_TREASURY } from "../../vips/vip-498/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import ERC20_ABI from "./abi/erc20.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const AMOUNT = parseUnits("20000", 18);

forking(49757941, async () => {
  let usdtBalanceOfVanguardTreasury: BigNumber;
  let usdtTreasuryBalanceBefore: BigNumber;
  let usdt: Contract;

  before(async () => {
    const provider = ethers.provider;
    usdt = new ethers.Contract(USDT, ERC20_ABI, provider);

    usdtBalanceOfVanguardTreasury = await usdt.balanceOf(VANGUARD_TREASURY);
    usdtTreasuryBalanceBefore = await usdt.balanceOf(bscmainnet.VTREASURY);
  });

  testVip("VIP-498", await vip498(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });

  describe("check balances", async () => {
    it("check usdt balance of Vanguard Treasury", async () => {
      const newBalance = await usdt.balanceOf(VANGUARD_TREASURY);
      expect(newBalance).to.equals(usdtBalanceOfVanguardTreasury.add(AMOUNT));
    });

    it("check usdt balance of Treasury", async () => {
      const newBalance = await usdt.balanceOf(bscmainnet.VTREASURY);
      expect(newBalance).to.equals(usdtTreasuryBalanceBefore.sub(AMOUNT));
    });
  });
});
