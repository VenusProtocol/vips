import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { BRIDGE_ASSETS, COMMUNITY_WALLET, OPBNB_BRIDGE, USDT, vip254 } from "../../vips/vip-254";
import BRIDGE_ABI from "./abi/bridgeAbi.json";
import TREASURY_ABI from "./abi/treasuryAbi.json";
import USDT_ABI from "./abi/usdtAbi.json";

forking(36070082, () => {
  let prevDeposits: [BigNumber];
  let bridge: Contract;
  const provider = ethers.provider;
  let walletBeforeBalance: BigNumber;
  let usdt: Contract;

  before(async () => {
    bridge = new ethers.Contract(OPBNB_BRIDGE, BRIDGE_ABI, provider);
    usdt = new ethers.Contract(USDT, USDT_ABI, provider);
    BRIDGE_ASSETS.map(async market => {
      const val = await bridge.deposits(market.localAddress, market.remoteAddress);
      prevDeposits.push(val);
    });
    walletBeforeBalance = await usdt.balanceOf(COMMUNITY_WALLET);
  });
  testVip("VIP-254", vip254(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [BRIDGE_ABI, TREASURY_ABI],
        ["ERC20BridgeInitiated", "ETHBridgeInitiated", "WithdrawTreasuryBEP20"],
        [4, 1, 6],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase Community wallet balance by 10,000 USDT", async () => {
      const walletBalanceAfter = await usdt.balanceOf(COMMUNITY_WALLET);
      expect(walletBalanceAfter.sub(walletBeforeBalance)).equals(ethers.utils.parseUnits("10000", 18));
    });
    it("Should increase correct deposits", async () => {
      BRIDGE_ASSETS.map(async (market, i) => {
        const val = await bridge.deposits(market.localAddress, market.remoteAddress);
        expect(val).equals(prevDeposits[i].add(market.amount));
      });
    });
  });
});
