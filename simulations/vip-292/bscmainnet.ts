import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { COMMUNITY_WALLET, USDT, vip292 } from "../../vips/vip-292/bscmainnet";
import VTREASURY_ABI from "./abi/VTreasuryAbi.json";
import USDT_ABI from "./abi/usdtAbi.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const USDT_AMOUNT = parseUnits("5000", 18);

forking(37996309, () => {
  let usdt: Contract;
  let prevBalanceTreasury: BigNumber;

  before(async () => {
    usdt = await ethers.getContractAt(USDT_ABI, USDT);
    prevBalanceTreasury = await usdt.balanceOf(bscmainnet.VTREASURY);
  });

  describe("Pre-Execution state", () => {
    it("check usdt balance", async () => {
      expect(await usdt.balanceOf(bscmainnet.VTREASURY)).to.equal(prevBalanceTreasury);
      expect(await usdt.balanceOf(COMMUNITY_WALLET)).to.equal(0);
    });
  });

  testVip("VIP-292 Transfer USDT to Community wallet", vip292(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [1]);
    },
  });

  describe("Post-Execution state", () => {
    it("check usdt balance after execution", async () => {
      expect(await usdt.balanceOf(bscmainnet.VTREASURY)).to.equal(prevBalanceTreasury.sub(USDT_AMOUNT));
      expect(await usdt.balanceOf(COMMUNITY_WALLET)).to.equal(USDT_AMOUNT);
    });
  });
});
