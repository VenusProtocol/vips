import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip700, {
  PENDLE_MARKET_SLISBNB,
  PENDLE_PT_VAULT_ADAPTER,
  vPT_clisBNB_25JUN2026,
} from "../../vips/vip-700/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import ADAPTER_ABI from "./abi/PendlePTVaultAdapter.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

forking(85953737, async () => {
  const provider = ethers.provider;
  let adapter: Contract;
  let acm: Contract;

  before(async () => {
    adapter = new ethers.Contract(PENDLE_PT_VAULT_ADAPTER, ADAPTER_ABI, provider);
    acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("pending owner should be the Normal Timelock", async () => {
      expect(await adapter.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });

    it("should have no markets registered", async () => {
      expect(await adapter.getMarketCount()).to.equal(0);
    });
  });

  testVip("VIP-700 PendlePTVaultAdapter", await vip700(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI, ADAPTER_ABI],
        ["RoleGranted", "OwnershipTransferred", "MarketAdded"],
        [9, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("owner should be the Normal Timelock", async () => {
      expect(await adapter.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("pending owner should be zero address", async () => {
      expect(await adapter.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("should have 1 market registered", async () => {
      expect(await adapter.getMarketCount()).to.equal(1);
    });

    it("should have the slisBNB Pendle market in the list", async () => {
      const markets = await adapter.getAllMarkets();
      expect(markets).to.include(PENDLE_MARKET_SLISBNB);
    });

    it("market config should have correct vToken", async () => {
      const config = await adapter.markets(PENDLE_MARKET_SLISBNB);
      expect(config.vToken).to.equal(vPT_clisBNB_25JUN2026);
    });

    it("Normal Timelock should have permission to call addMarket", async () => {
      const role = ethers.utils.solidityKeccak256(
        ["address", "string"],
        [PENDLE_PT_VAULT_ADAPTER, "addMarket(address,address)"],
      );
      expect(await acm.hasRole(role, NORMAL_TIMELOCK)).to.be.true;
    });

    for (const account of [
      { name: "Normal Timelock", address: bscmainnet.NORMAL_TIMELOCK },
      { name: "Fast Track Timelock", address: bscmainnet.FAST_TRACK_TIMELOCK },
      { name: "Critical Timelock", address: bscmainnet.CRITICAL_TIMELOCK },
      { name: "Guardian", address: bscmainnet.GUARDIAN },
    ]) {
      it(`${account.name} should have permission to call pause`, async () => {
        const role = ethers.utils.solidityKeccak256(["address", "string"], [PENDLE_PT_VAULT_ADAPTER, "pause()"]);
        expect(await acm.hasRole(role, account.address)).to.be.true;
      });

      it(`${account.name} should have permission to call unpause`, async () => {
        const role = ethers.utils.solidityKeccak256(["address", "string"], [PENDLE_PT_VAULT_ADAPTER, "unpause()"]);
        expect(await acm.hasRole(role, account.address)).to.be.true;
      });
    }
  });
});
