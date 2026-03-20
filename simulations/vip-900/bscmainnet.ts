import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip900, {
  ACM,
  ALL_TIMELOCKS,
  NORMAL_TIMELOCK,
  PENDLE_MARKET_SLISBNB,
  PENDLE_PT_VAULT_ADAPTER,
  VTOKEN_PT_CLISBNBX,
} from "../../vips/vip-900/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import ADAPTER_ABI from "./abi/PendlePTVaultAdapter.json";

forking(87722692, async () => {
  const provider = ethers.provider;
  let adapter: Contract;
  let accessControlManager: Contract;

  before(async () => {
    const adapterSigner = await initMainnetUser(PENDLE_PT_VAULT_ADAPTER, ethers.utils.parseEther("1"));
    adapter = new ethers.Contract(PENDLE_PT_VAULT_ADAPTER, ADAPTER_ABI, provider);
    accessControlManager = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, adapterSigner);
  });

  describe("Pre-VIP behavior", async () => {
    it("should have ACM configured correctly", async () => {
      expect(await adapter.accessControlManager()).to.equal(ACM);
    });

    it("pending owner should be the Normal Timelock", async () => {
      expect(await adapter.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });

    it("should have no markets registered", async () => {
      expect(await adapter.getMarketCount()).to.equal(0);
    });

    ALL_TIMELOCKS.forEach(timelock => {
      it(`should not have pause permission for ${timelock}`, async () => {
        expect(await accessControlManager.isAllowedToCall(timelock, "pause()")).to.equal(false);
      });

      it(`should not have unpause permission for ${timelock}`, async () => {
        expect(await accessControlManager.isAllowedToCall(timelock, "unpause()")).to.equal(false);
      });
    });

    it("should not have addMarket permission for Normal Timelock", async () => {
      expect(await accessControlManager.isAllowedToCall(NORMAL_TIMELOCK, "addMarket(address,address)")).to.equal(false);
    });
  });

  testVip("VIP-900 PendlePTVaultAdapter", await vip900(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [ADAPTER_ABI], ["OwnershipTransferred", "MarketAdded"], [1, 1]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [7]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("owner should be the Normal Timelock", async () => {
      expect(await adapter.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("should have 1 market registered", async () => {
      expect(await adapter.getMarketCount()).to.equal(1);
    });

    it("should have the slisBNB Pendle market in the list", async () => {
      const markets = await adapter.getAllMarkets();
      expect(markets).to.include(PENDLE_MARKET_SLISBNB);
    });

    it("market config should have correct vToken and maturity", async () => {
      const config = await adapter.markets(PENDLE_MARKET_SLISBNB);
      expect(config.vToken).to.equal(VTOKEN_PT_CLISBNBX);
      expect(config.maturity).to.equal(1782345600); // June 25, 2026 00:00:00 UTC
    });

    ALL_TIMELOCKS.forEach(timelock => {
      it(`should have pause permission for ${timelock}`, async () => {
        expect(await accessControlManager.isAllowedToCall(timelock, "pause()")).to.equal(true);
      });

      it(`should have unpause permission for ${timelock}`, async () => {
        expect(await accessControlManager.isAllowedToCall(timelock, "unpause()")).to.equal(true);
      });
    });

    it("should have addMarket permission for Normal Timelock", async () => {
      expect(await accessControlManager.isAllowedToCall(NORMAL_TIMELOCK, "addMarket(address,address)")).to.equal(true);
    });
  });
});
