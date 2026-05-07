import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumberish, Contract } from "ethers";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999, { XVS_PROXY_OFT_SRC, remoteBridgeEntries } from "../../vips/vip-999/bscmainnet";
import XVS_BRIDGE_ADMIN_ABI from "./abi/XVSBridgeAdmin.json";
import XVS_BRIDGE_SRC_ABI from "./abi/XVSProxyOFTSrc.json";

const SUPPORTER = "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced";

const readLimits = async (bridge: Contract, dstLzChainId: LzChainId) => ({
  maxDailyLimit: await bridge.chainIdToMaxDailyLimit(dstLzChainId),
  maxSingleTransactionLimit: await bridge.chainIdToMaxSingleTransactionLimit(dstLzChainId),
});

const expectLimitsEqual = (
  actual: Record<string, BigNumberish>,
  expected: Record<string, BigNumberish>,
  label: string,
) => {
  for (const key of Object.keys(expected)) {
    expect(actual[key], `${label}.${key}`).to.equal(expected[key]);
  }
};

forking(96883423, async () => {
  const provider = ethers.provider;
  let bridge: Contract;

  beforeEach(async () => {
    bridge = new ethers.Contract(XVS_PROXY_OFT_SRC, XVS_BRIDGE_SRC_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    for (const entry of remoteBridgeEntries) {
      describe(`chain ${LzChainId[entry.dstLzChainId]} (${entry.dstLzChainId})`, () => {
        it("matches `before` limits", async () => {
          const onChain = await readLimits(bridge, entry.dstLzChainId);
          expectLimitsEqual(onChain, entry.before, "before");
        });
      });
    }
  });

  testVip("VIP-999 Update XVS bridge limits on BSC", await vip999(), {
    supporter: SUPPORTER,
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_SRC_ABI],
        ["SetMaxDailyLimit", "SetMaxSingleTransactionLimit", "Failure"],
        [5, 5, 0],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    for (const entry of remoteBridgeEntries) {
      describe(`chain ${LzChainId[entry.dstLzChainId]} (${entry.dstLzChainId})`, () => {
        it("matches `after` limits", async () => {
          const onChain = await readLimits(bridge, entry.dstLzChainId);
          expectLimitsEqual(onChain, entry.after, "after");
        });
      });
    }
  });
});
